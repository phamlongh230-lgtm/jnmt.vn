import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const tinkercadClassesTable = pgTable("tinkercad_classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),          // e.g. "Lớp Việt Nam", "Lớp Mông Cổ"
  classCode: text("class_code").notNull().unique(), // e.g. "VN", "MN", "KZ"
  tinkercadUrl: text("tinkercad_url").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
