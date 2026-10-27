"use server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { checkPassword } from "../../lib/auth";
import {
  isValidLink,
  isValidProjectSource,
  isValidProjectCategory,
  hasAllowedImageMagic,
  MAX_IMAGE_BYTES,
} from "../../lib/validate";
import { db } from "../../lib/db";
import { projects } from "../../db/schema";

type WriteError = "invalid" | "dbfailure" | "image-too-large" | "image-type";

function fail(message: WriteError): never {
  redirect(`/admin?error=${message}`);
}

async function readImage(formData: FormData): Promise<string | null> {
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) return null;
  if (file.size > MAX_IMAGE_BYTES) fail("image-too-large");
  const buffer = Buffer.from(await file.arrayBuffer());
  if (!hasAllowedImageMagic(new Uint8Array(buffer), file.type)) fail("image-type");
  return `data:${file.type};base64,${buffer.toString("base64")}`;
}

export async function createProject(formData: FormData): Promise<void> {
  const password = formData.get("password") as string;
  const title = (formData.get("title") as string) || "";
  const link = ((formData.get("link") as string) || "").trim();
  const link2 = ((formData.get("link2") as string) || "").trim();
  const source = (formData.get("source") as string) || "";
  const category = (formData.get("category") as string) || "";
  if (
    !checkPassword(password) ||
    !title.trim() ||
    !isValidProjectSource(source) ||
    !isValidProjectCategory(category) ||
    (link && !isValidLink(link)) ||
    (link2 && !isValidLink(link2))
  ) {
    fail("invalid");
  }
  const image = await readImage(formData);
  try {
    await db.insert(projects).values({
      title: title.trim(),
      description: ((formData.get("description") as string) || "").trim() || null,
      technologies: ((formData.get("technologies") as string) || "").trim() || null,
      link: link || null,
      link2: link2 || null,
      source,
      category,
      image,
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
  const link2 = ((formData.get("link2") as string) || "").trim();
  const source = (formData.get("source") as string) || "";
  const category = (formData.get("category") as string) || "";
  if (
    !checkPassword(password) ||
    !Number.isInteger(id) ||
    id <= 0 ||
    !title.trim() ||
    !isValidProjectSource(source) ||
    !isValidProjectCategory(category) ||
    (link && !isValidLink(link)) ||
    (link2 && !isValidLink(link2))
  ) {
    fail("invalid");
  }
  const image = await readImage(formData);
  const removeImage = formData.get("removeImage") === "on";
  try {
    await db
      .update(projects)
      .set({
        title: title.trim(),
        description: ((formData.get("description") as string) || "").trim() || null,
        technologies: ((formData.get("technologies") as string) || "").trim() || null,
        link: link || null,
        link2: link2 || null,
        source,
        category,
        ...(image ? { image } : removeImage ? { image: null } : {}),
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
