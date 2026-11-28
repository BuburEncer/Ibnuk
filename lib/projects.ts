import { db } from "./db";
import { projectImages, projects } from "../db/schema";
import { asc, eq, sql } from "drizzle-orm";

// Media bytes stay in the DB; pages get flags and load bytes from /projects/[id]/media/[kind].
const projectFields = {
  id: projects.id,
  title: projects.title,
  description: projects.description,
  technologies: projects.technologies,
  link: projects.link,
  link2: projects.link2,
  source: projects.source,
  category: projects.category,
  createdAt: projects.createdAt,
  // Same allowlists as parseImageDataUrl/parseVideoDataUrl, so a flag is true only when the media route will serve it.
  hasImage: sql<boolean>`coalesce(${projects.image} ~ '^data:image/(png|jpeg|webp|gif);base64,', false)`.mapWith(Boolean),
  hasVideo: sql<boolean>`coalesce(${projects.video} ~ '^data:video/(mp4|webm);base64,', false)`.mapWith(Boolean),
  // First gallery image id, the list preview when there is no main image.
  // "projects"."id" is spelled out: Drizzle renders ${projects.id} unqualified, which binds to project_images.id here.
  // ponytail: assumes FROM "projects" with no alias; rebuild with sql.identifier if projects is ever aliased.
  coverImageId: sql<number | null>`(select id from project_images where project_id = "projects"."id" order by id limit 1)`,
};

const selectProjects = () => db.select(projectFields).from(projects);

export type Project = Awaited<ReturnType<typeof selectProjects>>[number];

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
    const rows = await selectProjects().orderBy(asc(projects.createdAt));
    return { projects: rows, failed: false };
  } catch (e) {
    console.error("listProjects failed:", e);
    return { projects: [], failed: true };
  }
}

export async function listProjectImages(): Promise<{
  images: { id: number; projectId: number; caption: string }[];
  failed: boolean;
}> {
  try {
    const images = await db
      .select({ id: projectImages.id, projectId: projectImages.projectId, caption: projectImages.caption })
      .from(projectImages)
      .orderBy(asc(projectImages.id));
    return { images, failed: false };
  } catch (e) {
    console.error("listProjectImages failed:", e);
    return { images: [], failed: true };
  }
}

export async function listGallery(
  projectId: number,
): Promise<{ images: { id: number; caption: string }[]; failed: boolean }> {
  try {
    const images = await db
      .select({ id: projectImages.id, caption: projectImages.caption })
      .from(projectImages)
      .where(eq(projectImages.projectId, projectId))
      .orderBy(asc(projectImages.id));
    return { images, failed: false };
  } catch (e) {
    console.error("listGallery failed:", e);
    return { images: [], failed: true };
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
    const [row] = await selectProjects().where(eq(projects.id, id)).limit(1);
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
