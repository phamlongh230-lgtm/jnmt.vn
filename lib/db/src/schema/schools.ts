import { pgTable, text, serial, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const schoolTypeEnum = pgEnum("school_type", [
  "university",
  "college",
  "high_school",
  "vocational",
  "other",
]);

export const schoolsTable = pgTable("schools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameKo: text("name_ko"),
  nameEn: text("name_en"),
  slug: text("slug").notNull().unique(),
  link: text("link"),
  type: schoolTypeEnum("type").notNull().default("university"),
  city: text("city"),
  country: text("country").notNull().default("KR"),
  description: text("description"),
});

export const insertSchoolSchema = createInsertSchema(schoolsTable).omit({ id: true });
export type InsertSchool = z.infer<typeof insertSchoolSchema>;
export type School = typeof schoolsTable.$inferSelect;
