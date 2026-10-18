"use server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { checkPassword } from "../../lib/auth";
import { db } from "../../lib/db";
import { projects } from "../../db/schema";

function isLinkValid(link: string): boolean {
  try {
    new URL(link);
    return true;
  } catch {
    return false;
  }
}

export async function createProject(formData: FormData): Promise<void> {
  const password = formData.get("password") as string;
  const title = (formData.get("title") as string) || "";
  const link = ((formData.get("link") as string) || "").trim();
  if (!checkPassword(password) || !title || (link && !isLinkValid(link))) {
    redirect("/admin?error=invalid");
  }
  await db.insert(projects).values({
    title,
    description: (formData.get("description") as string) || null,
    technologies: (formData.get("technologies") as string) || null,
    link: link || null,
  });
  redirect("/projects");
}

export async function updateProject(formData: FormData): Promise<void> {
  const password = formData.get("password") as string;
  const id = Number(formData.get("id"));
  const title = (formData.get("title") as string) || "";
  const link = ((formData.get("link") as string) || "").trim();
  if (!checkPassword(password) || Number.isNaN(id) || !title || (link && !isLinkValid(link))) {
    redirect("/admin?error=invalid");
  }
  await db
    .update(projects)
    .set({
      title,
      description: (formData.get("description") as string) || null,
      technologies: (formData.get("technologies") as string) || null,
      link: link || null,
    })
    .where(eq(projects.id, id));
  redirect("/projects");
}

export async function deleteProject(formData: FormData): Promise<void> {
  const password = formData.get("password") as string;
  const id = Number(formData.get("id"));
  if (!checkPassword(password) || Number.isNaN(id)) {
    redirect("/admin?error=invalid");
  }
  await db.delete(projects).where(eq(projects.id, id));
  redirect("/projects");
}
