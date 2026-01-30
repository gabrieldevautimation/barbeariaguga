import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { sendNoShowEmail } from "./_core/email";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

// Simple password hashing (in production, use bcrypt)
function hashPassword(password: string): string {
  return Buffer.from(password).toString('base64');
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      // ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      // Also clear barber session if exists
      // ctx.res.clearCookie('barber_session', { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  barbers: router({
    // Public: list all active barbers
    list: publicProcedure.query(async () => {
      return await db.getAllBarbers();
    }),

    // Barber login with password
    login: publicProcedure
      .input(z.object({
        name: z.string(),
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const barber = await db.getBarberByName(input.name);

        if (!barber || !verifyPassword(input.password, barber.password)) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Nome ou senha inválidos',
          });
        }

        // Set barber session cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie('barber_session', JSON.stringify({
          id: barber.id,
          name: barber.name
        }), {
          ...cookieOptions,
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return {
          id: barber.id,
          name: barber.name,
        };
      }),

    // Get current barber from session
    me: publicProcedure.query(({ ctx }) => {
      // DEBUG: Temporarily commented out to isolate auth issues
      // const barberCookie = ctx.req.cookies?.barber_session;
      // if (!barberCookie) return null;

      // try {
      //   return JSON.parse(barberCookie);
      // } catch {
      //   return null;
      // }
      return null;
    }),
  }),

  services: router({
    list: publicProcedure.query(async () => {
      return await db.getAllServices();
    }),
  }),

  appointments: router({
    // Create new appointment (requires user auth)
    create: protectedProcedure
      .input(z.object({
        barberId: z.number(),
        serviceId: z.number(),
        appointmentDate: z.string(), // ISO date string
        appointmentTime: z.string(),
        clientName: z.string(),
        clientPhone: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const dateStr = input.appointmentDate;
        const [year, month, day] = dateStr.split('-').map(Number);
        // Use Date.UTC to prevent timezone conversion issues
        const appointmentDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

        const hasConflict = await db.checkAppointmentConflict(
          input.barberId,
          appointmentDate,
          input.appointmentTime
        );

        if (hasConflict) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Este horario ja esta agendado para este barbeiro. Escolha outro horario.',
          });
        }

        const appointment = await db.createAppointment({
          userId: ctx.user.id,
          barberId: input.barberId,
          serviceId: input.serviceId,
          appointmentDate: appointmentDate,
          appointmentTime: input.appointmentTime,
          clientName: input.clientName,
          clientPhone: input.clientPhone,
          notes: input.notes,
          status: 'pending',
        });

        return appointment;
      }),

    // Get appointments for logged-in user
    myAppointments: protectedProcedure.query(async ({ ctx }) => {
      const userAppointments = await db.getAppointmentsByUserId(ctx.user.id);

      // Enrich with barber and service details
      const enriched = await Promise.all(
        userAppointments.map(async (apt) => {
          const barber = await db.getBarberById(apt.barberId);
          const service = await db.getServiceById(apt.serviceId);
          return {
            ...apt,
            barber,
            service,
          };
        })
      );

      return enriched;
    }),

    // Get appointments for a specific barber (client-side passes barberId)
    barberAppointments: publicProcedure
      .input(z.object({
        barberId: z.number(),
      }))
      .query(async ({ input }) => {
        const barberAppointments = await db.getUpcomingAppointmentsByBarberId(input.barberId);

        // Enrich with service details
        const enriched = await Promise.all(
          barberAppointments.map(async (apt) => {
            const service = await db.getServiceById(apt.serviceId);
            return {
              ...apt,
              service,
            };
          })
        );

        return enriched;
      }),

    // Get appointments for a specific barber on a specific date
    barberAppointmentsByDate: publicProcedure
      .input(z.object({
        barberId: z.number(),
        date: z.string(),
      }))
      .query(async ({ input }) => {
        const date = new Date(input.date);
        const barberAppointments = await db.getAppointmentsByBarberIdAndDate(input.barberId, date);

        const enriched = await Promise.all(
          barberAppointments.map(async (apt) => {
            const service = await db.getServiceById(apt.serviceId);
            return {
              ...apt,
              service,
            };
          })
        );

        return enriched;
      }),

    // Cancel appointment
    cancel: protectedProcedure
      .input(z.object({
        appointmentId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const appointment = await db.getAppointmentById(input.appointmentId);

        if (!appointment) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Agendamento nao encontrado',
          });
        }

        if (appointment.userId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Voce nao tem permissao para cancelar este agendamento',
          });
        }

        await db.cancelAppointment(input.appointmentId);

        return {
          success: true,
          message: 'Agendamento cancelado com sucesso',
        };
      }),

    // Complete appointment
    complete: publicProcedure
      .input(z.object({
        appointmentId: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.completeAppointment(input.appointmentId);
        return {
          success: true,
          message: 'Corte finalizado com sucesso',
        };
      }),

    // Mark appointment as no-show
    markNoShow: publicProcedure
      .input(z.object({
        appointmentId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const appointment = await db.getAppointmentById(input.appointmentId);

        if (!appointment) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Agendamento nao encontrado',
          });
        }

        await db.markAppointmentAsNoShow(input.appointmentId);
        await db.incrementUserNoShowCount(appointment.userId);

        const user = await db.getUserById(appointment.userId);
        if (user && user.email) {
          const barber = await db.getBarberById(appointment.barberId);
          await sendNoShowEmail(
            user.email,
            user.name || 'Cliente',
            barber?.name || 'Barbeiro',
            user.noShowCount + 1
          );
        }

        return {
          success: true,
          message: 'Cliente marcado como nao compareceu',
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
