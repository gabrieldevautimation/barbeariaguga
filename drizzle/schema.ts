import { serial, pgTable, text, timestamp, varchar, pgEnum, unique, boolean, integer } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * Extended with role field to differentiate between clients and barbers.
 */
export const roleEnum = pgEnum("role", ["user", "admin"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  noShowCount: integer("noShowCount").default(0).notNull(), // tracks how many times client didn't show up
  isBlocked: boolean("isBlocked").default(false).notNull(), // 1 = blocked from booking, 0 = allowed
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Barbers table - stores barber profiles with password authentication
 */
export const barbers = pgTable("barbers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: text("imageUrl"),
  password: varchar("password", { length: 255 }).notNull(), // hashed password
  isActive: boolean("isActive").default(true).notNull(), // 1 = active, 0 = inactive
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Barber = typeof barbers.$inferSelect;
export type InsertBarber = typeof barbers.$inferInsert;

/**
 * Services table - stores available services
 */
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: varchar("price", { length: 50 }),
  duration: integer("duration"), // duration in minutes
  isFeatured: boolean("isFeatured").default(false).notNull(), // 1 = featured, 0 = normal
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;

/**
 * Appointments table - stores all appointments
 */
export const statusEnum = pgEnum("status", ["pending", "confirmed", "completed", "cancelled", "no-show"]);

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(), // references users.id
  barberId: integer("barberId").notNull(), // references barbers.id
  serviceId: integer("serviceId").notNull(), // references services.id
  appointmentDate: timestamp("appointmentDate").notNull(),
  appointmentTime: varchar("appointmentTime", { length: 10 }).notNull(), // e.g., "14:00"
  status: statusEnum("status").default("pending").notNull(),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  clientPhone: varchar("clientPhone", { length: 20 }),
  notes: text("notes"),
  noShowReason: text("noShowReason"), // reason client provided for not showing up
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  // Unique constraint: prevents duplicate appointments for the same barber at the same date/time
  uniqueAppointment: unique().on(table.barberId, table.appointmentDate, table.appointmentTime),
}));

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;
