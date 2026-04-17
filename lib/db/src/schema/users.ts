import { pgTable, text, serial, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const roleEnum = pgEnum("user_role", ["user", "moderator", "admin"]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").notNull().default("user"),
  isActive: boolean("is_active").notNull().default(true),
  avatarColor: text("avatar_color").notNull().default("#2563eb"),
  avatarUrl: text("avatar_url"),
  classGroup: text("class_group"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastLogin: timestamp("last_login"),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, lastLogin: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
