import { sql } from "drizzle-orm";
import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(), // We will use Clerk ID here
  clerkId: text("clerk_id").notNull().unique(),
  role: text("role", { enum: ["freelancer", "client", "parent"] }).notNull(),
  name: text("name").notNull(),
  username: text("username").notNull(),
  age: integer("age"),
  parentalCode: text("parental_code"),
  balance: integer("balance").default(0).notNull(),
  taskQuotaDaily: integer("task_quota_daily").default(1).notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  budget: integer("budget").notNull(),
  status: text("status", { enum: ["open", "taken", "submitted", "completed"] }).default("open").notNull(),
  clientId: text("client_id").references(() => users.id).notNull(),
  freelancerId: text("freelancer_id").references(() => users.id),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  takenAt: text("taken_at"),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;