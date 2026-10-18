import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  technologies: text("technologies"),
  link: text("link"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
