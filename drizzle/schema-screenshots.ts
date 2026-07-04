import { int, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import { mods } from "./schema";

/**
 * Screenshots table for mod gallery support
 * Allows each mod to have multiple screenshots
 */
export const screenshots = mysqlTable("screenshots", {
  id: int("id").autoincrement().primaryKey(),
  modId: int("modId").notNull().references(() => mods.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  caption: text("caption"),
  order: int("order").default(0), // For ordering screenshots
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Screenshot = typeof screenshots.$inferSelect;
export type InsertScreenshot = typeof screenshots.$inferInsert;
