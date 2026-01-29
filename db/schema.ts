
import { sql } from "drizzle-orm";
import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(), 
  clerkId: text("clerk_id").notNull().unique(),
  role: text("role").notNull(),
  name: text("name").notNull(),
  username: text("username").notNull(),
  age: integer("age"),
  parentalCode: text("parental_code"),
  balance: integer("balance").default(0).notNull(),
  xp: integer("xp").default(0).notNull(),
  taskQuotaDaily: integer("task_quota_daily").default(1).notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  budget: integer("budget").notNull(),
  deadline: text("deadline"), // Kolom optional untuk tenggang waktu
  status: text("status").notNull().default("open"), 
  clientId: text("client_id").references(() => users.id).notNull(),
  freelancerId: text("freelancer_id").references(() => users.id),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  takenAt: text("taken_at"),
  submissionUrl: text("submission_url"), 
  submissionNote: text("submission_note"), 
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  taskId: text("task_id").references(() => tasks.id).notNull(),
  senderId: text("sender_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Message = typeof messages.$inferSelect;
