import { and, eq } from "drizzle-orm";
import { db } from "../../../../../lib/db";
import { parseProjectId } from "../../../../../lib/projects";
import { parseImageDataUrl } from "../../../../../lib/validate";
import { projectImages } from "../../../../../db/schema";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> },
) {
  const { id, imageId } = await params;
  const projectId = parseProjectId(id);
  const imageRowId = parseProjectId(imageId);
  if (!projectId || !imageRowId) return new Response("Not found", { status: 404 });
  let row: { image: string } | undefined;
  try {
    [row] = await db
      .select({ image: projectImages.image })
      .from(projectImages)
      .where(and(eq(projectImages.projectId, projectId), eq(projectImages.id, imageRowId)))
      .limit(1);
  } catch (e) {
    console.error("gallery image failed:", e);
    return new Response("Could not load image", { status: 503 });
  }
  const parsed = row && parseImageDataUrl(row.image);
  if (!parsed) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(parsed.bytes), {
    headers: {
      "Content-Type": parsed.type,
      // Short cache: a deleted image must stop being served within the hour.
      "Cache-Control": "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
