import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";

function createAuthenticatedContext(): { ctx: TrpcContext } {
  const user: User = {
    id: 999,
    openId: "test-user-openid",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
      cookies: {},
    } as TrpcContext["req"],
    res: {
      cookie: () => {},
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("appointments router", () => {
  it("should create appointment for authenticated user", async () => {
    const { ctx } = createAuthenticatedContext();
    const caller = appRouter.createCaller(ctx);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = await caller.appointments.create({
      barberId: 1,
      serviceId: 1,
      appointmentDate: tomorrow.toISOString().split('T')[0] || '',
      appointmentTime: "14:00",
      clientName: "Test User",
      clientPhone: "(11) 98765-4321",
      notes: "Test appointment",
    });

    expect(result).toBeDefined();
  });

  it("should list appointments for authenticated user", async () => {
    const { ctx } = createAuthenticatedContext();
    const caller = appRouter.createCaller(ctx);

    const appointments = await caller.appointments.myAppointments();

    expect(Array.isArray(appointments)).toBe(true);
  });

  it("should reject appointment creation for unauthenticated user", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
        cookies: {},
      } as TrpcContext["req"],
      res: {
        cookie: () => {},
        clearCookie: () => {},
      } as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.appointments.create({
        barberId: 1,
        serviceId: 1,
        appointmentDate: "2024-12-25",
        appointmentTime: "14:00",
        clientName: "Test User",
      })
    ).rejects.toThrow();
  });
});
