import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, datetime, unique } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with role field to differentiate between clients and barbers.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  noShowCount: int("noShowCount").default(0).notNull(), // tracks how many times client didn't show up
  isBlocked: int("isBlocked").default(0).notNull(), // 1 = blocked from booking, 0 = allowed
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Barbers table - stores barber profiles with password authentication
 */
export const barbers = mysqlTable("barbers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: text("imageUrl"),
  password: varchar("password", { length: 255 }).notNull(), // hashed password
  isActive: int("isActive").default(1).notNull(), // 1 = active, 0 = inactive
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Barber = typeof barbers.$inferSelect;
export type InsertBarber = typeof barbers.$inferInsert;

/**
 * Services table - stores available services
 */
export const services = mysqlTable("services", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: varchar("price", { length: 50 }),
  duration: int("duration"), // duration in minutes
  isFeatured: int("isFeatured").default(0).notNull(), // 1 = featured, 0 = normal
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;

/**
 * Appointments table - stores all appointments
 */
export const appointments = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // references users.id
  barberId: int("barberId").notNull(), // references barbers.id
  serviceId: int("serviceId").notNull(), // references services.id
  appointmentDate: datetime("appointmentDate").notNull(),
  appointmentTime: varchar("appointmentTime", { length: 10 }).notNull(), // e.g., "14:00"
  status: mysqlEnum("status", ["pending", "confirmed", "completed", "cancelled", "no-show"]).default("pending").notNull(),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  clientPhone: varchar("clientPhone", { length: 20 }),
  notes: text("notes"),
  noShowReason: text("noShowReason"), // reason client provided for not showing up
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  // Unique constraint: prevents duplicate appointments for the same barber at the same date/time
  uniqueAppointment: unique().on(table.barberId, table.appointmentDate, table.appointmentTime),
}));

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;
