import { eq, and, gte, lte, ne } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, users, barbers, services, appointments, InsertAppointment } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && ENV.databaseUrl) {
    try {
      // Serverless: max 1 connection to prevent exhaustion
      const client = postgres(ENV.databaseUrl, {
        ssl: 'require',
        max: 1,
        idle_timeout: 20,
        connect_timeout: 10
      });
      _db = drizzle(client);
      console.log('[Database] Connected successfully (Serverless mode)');
    } catch (error) {
      console.error("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  if (!_db) {
    console.error('[Database] DATABASE_URL not configured or connection failed');
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Barber queries
export async function getAllBarbers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(barbers).where(eq(barbers.isActive, true));
}

export async function getBarberById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(barbers).where(eq(barbers.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getBarberByName(name: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(barbers).where(eq(barbers.name, name)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Service queries
export async function getAllServices() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(services);
}

export async function getServiceById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(services).where(eq(services.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Appointment queries
export async function createAppointment(appointment: InsertAppointment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(appointments).values(appointment);
  return result;
}

export async function getAppointmentsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(appointments).where(eq(appointments.userId, userId));
}

export async function getAppointmentsByBarberId(barberId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(appointments).where(eq(appointments.barberId, barberId));
}

export async function getAppointmentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function checkAppointmentConflict(barberId: number, appointmentDate: Date, appointmentTime: string) {
  const db = await getDb();
  if (!db) return false;

  // Get start and end of the day
  const startOfDay = new Date(appointmentDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(appointmentDate);
  endOfDay.setHours(23, 59, 59, 999);

  const existing = await db.select().from(appointments)
    .where(
      and(
        eq(appointments.barberId, barberId),
        gte(appointments.appointmentDate, startOfDay),
        lte(appointments.appointmentDate, endOfDay),
        eq(appointments.appointmentTime, appointmentTime),
        ne(appointments.status, 'cancelled')
      )
    );

  return existing.length > 0;
}

export async function cancelAppointment(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.update(appointments).set({ status: 'cancelled' }).where(eq(appointments.id, id));
  return result;
}

export async function getAppointmentsByBarberIdAndDate(barberId: number, date: Date) {
  const db = await getDb();
  if (!db) return [];

  // Get start and end of the day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return await db.select().from(appointments)
    .where(
      and(
        eq(appointments.barberId, barberId),
        gte(appointments.appointmentDate, startOfDay),
        lte(appointments.appointmentDate, endOfDay),
        ne(appointments.status, 'cancelled')
      )
    );
}

export async function getUpcomingAppointmentsByBarberId(barberId: number) {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();

  return await db.select().from(appointments)
    .where(
      and(
        eq(appointments.barberId, barberId),
        gte(appointments.appointmentDate, now),
        ne(appointments.status, 'cancelled')
      )
    );
}

export async function completeAppointment(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return await db.update(appointments).set({ status: 'completed' }).where(eq(appointments.id, id));
}

export async function markAppointmentAsNoShow(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return await db.update(appointments).set({ status: 'no-show' }).where(eq(appointments.id, id));
}

export async function incrementUserNoShowCount(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (user.length === 0) return undefined;

  const newCount = (user[0].noShowCount || 0) + 1;
  const isBlocked = newCount >= 2;

  return await db.update(users).set({
    noShowCount: newCount,
    isBlocked: isBlocked
  }).where(eq(users.id, userId));
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}
