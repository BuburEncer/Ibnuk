import { db } from "./db";
import { projects } from "../db/schema";
import { asc } from "drizzle-orm";

type Project = typeof projects.$inferSelect;

export type ProjectGroups<T = Project> = {
  ai: T[];
  software: T[];
  other: T[];
};

export type ProjectListResult = {
  projects: Project[];
  failed: boolean;
};

export function getProjectListState(
  result: ProjectListResult,
): "error" | "empty" | "ready" {
  if (result.failed) return "error";
  return result.projects.length === 0 ? "empty" : "ready";
}

export async function listProjects(): Promise<ProjectListResult> {
  try {
    const rows = await db
      .select()
      .from(projects)
      .orderBy(asc(projects.createdAt));
    return { projects: rows, failed: false };
  } catch (e) {
    console.error("listProjects failed:", e);
    return { projects: [], failed: true };
  }
}

export function groupProjects<T extends { category: string | null }>(
  rows: T[],
): ProjectGroups<T> {
  const groups: ProjectGroups<T> = { ai: [], software: [], other: [] };
  for (const row of rows) {
    if (row.category === "ai") groups.ai.push(row);
    else if (row.category === "software") groups.software.push(row);
    else groups.other.push(row);
  }
  return groups;
}
