"use server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { checkPassword } from "../../lib/auth";
import { isValidLink, isValidProjectSource, isValidProjectCategory, isValidProjectImagePath } from "../../lib/validate";
import { db } from "../../lib/db";
import { projects } from "../../db/schema";

type WriteError = "invalid" | "dbfailure";

function fail(message: WriteError): never {
  redirect(`/admin?error=${message}`);
}

export async function createProject(formData: FormData): Promise<void> {
  const password = formData.get("password") as string;
  const title = (formData.get("title") as string) || "";
  const link = ((formData.get("link") as string) || "").trim();
  const source = (formData.get("source") as string) || "";
  const category = (formData.get("category") as string) || "";
  const rawImagePath = ((formData.get("imagePath") as string) || "").trim();
  if (
    !checkPassword(password) ||
    !title.trim() ||
    !isValidProjectSource(source) ||
    !isValidProjectCategory(category) ||
    (link && !isValidLink(link)) ||
    (rawImagePath && !isValidProjectImagePath(rawImagePath))
  ) {
    fail("invalid");
  }
  try {
    await db.insert(projects).values({
      title: title.trim(),
      description: ((formData.get("description") as string) || "").trim() || null,
      technologies: ((formData.get("technologies") as string) || "").trim() || null,
      link: link || null,
      source,
      category,
      imagePath: rawImagePath || null,
    });
  } catch {
    fail("dbfailure");
  }
  redirect("/projects");
}

export async function updateProject(formData: FormData): Promise<void> {
  const password = formData.get("password") as string;
  const id = Number(formData.get("id"));
  const title = (formData.get("title") as string) || "";
  const link = ((formData.get("link") as string) || "").trim();
  const source = (formData.get("source") as string) || "";
  const category = (formData.get("category") as string) || "";
  const rawImagePath = ((formData.get("imagePath") as string) || "").trim();
  if (
    !checkPassword(password) ||
    !Number.isInteger(id) ||
    id <= 0 ||
    !title.trim() ||
    !isValidProjectSource(source) ||
    !isValidProjectCategory(category) ||
    (link && !isValidLink(link)) ||
    (rawImagePath && !isValidProjectImagePath(rawImagePath))
  ) {
    fail("invalid");
  }
  try {
    await db
      .update(projects)
      .set({
        title: title.trim(),
        description: ((formData.get("description") as string) || "").trim() || null,
        technologies: ((formData.get("technologies") as string) || "").trim() || null,
        link: link || null,
        source,
        category,
        imagePath: rawImagePath || null,
      })
      .where(eq(projects.id, id));
  } catch {
    fail("dbfailure");
  }
  redirect("/projects");
}

export async function deleteProject(formData: FormData): Promise<void> {
  const password = formData.get("password") as string;
  const id = Number(formData.get("id"));
  if (!checkPassword(password) || Number.isNaN(id)) {
    fail("invalid");
  }
  try {
    await db.delete(projects).where(eq(projects.id, id));
  } catch {
    fail("dbfailure");
  }
  redirect("/projects");
}
