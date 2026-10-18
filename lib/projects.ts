import { db } from "./db";
import { projects } from "../db/schema";
import { asc } from "drizzle-orm";

export async function listProjects() {
  try {
    return await db.select().from(projects).orderBy(asc(projects.createdAt));
  } catch (e) {
    console.error("listProjects failed:", e);
    return [];
  }
}
