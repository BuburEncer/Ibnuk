import { db } from "./db";
import { projects } from "../db/schema";
import { asc, eq } from "drizzle-orm";

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

const MAX_SERIAL = 2147483647;

export function parseProjectId(raw: string): number | null {
  if (!/^[1-9]\d*$/.test(raw)) return null;
  const id = Number(raw);
  return id <= MAX_SERIAL ? id : null;
}

export async function getProject(
  id: number,
): Promise<{ project: Project | null; failed: boolean }> {
  try {
    const [row] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    return { project: row ?? null, failed: false };
  } catch (e) {
    console.error("getProject failed:", e);
    return { project: null, failed: true };
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

export function collectSkills(rows: { technologies: string | null }[]): string[] {
  const seen = new Map<string, string>();
  for (const row of rows) {
    for (const raw of (row.technologies ?? "").split(",")) {
      const skill = raw.trim();
      const key = skill.toLowerCase();
      if (skill && !seen.has(key)) seen.set(key, skill);
    }
  }
  return [...seen.values()];
}
