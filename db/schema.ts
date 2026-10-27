import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  technologies: text("technologies"),
  link: text("link"),
  link2: text("link2"),
  source: text("source"),
  category: text("category"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
