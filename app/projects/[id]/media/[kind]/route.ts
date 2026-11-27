import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "../../../../../lib/db";
import { parseProjectId } from "../../../../../lib/projects";
import { parseImageDataUrl, parseVideoDataUrl } from "../../../../../lib/validate";
import { projects } from "../../../../../db/schema";

const KINDS = {
  image: { column: projects.image, parse: parseImageDataUrl },
  video: { column: projects.video, parse: parseVideoDataUrl },
} as const;

const MAX_CHUNK = 2 * 1024 * 1024;

const notFound = () => new Response("Not found", { status: 404 });

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; kind: string }> },
) {
  const { id, kind } = await params;
  const projectId = parseProjectId(id);
  if (!projectId || !Object.hasOwn(KINDS, kind)) return notFound();
  const { column, parse } = KINDS[kind as keyof typeof KINDS];

  let row: { media: string | null } | undefined;
  // ponytail: every request (304 and each range chunk included) loads and decodes the whole data URL;
  // move media to object storage if traffic or file sizes grow.
  try {
    [row] = await db.select({ media: column }).from(projects).where(eq(projects.id, projectId)).limit(1);
  } catch (e) {
    console.error("project media failed:", e);
    return new Response("Could not load media", { status: 503 });
  }
  const parsed = row?.media ? parse(row.media) : null;
  if (!parsed) return notFound();

  // Main media is replaced in place on update, so revalidate every time; the ETag keeps it cheap.
  const etag = `"${createHash("sha256").update(parsed.bytes).digest("hex").slice(0, 16)}"`;
  const headers: Record<string, string> = {
    "Content-Type": parsed.type,
    "Cache-Control": "no-cache",
    "X-Content-Type-Options": "nosniff",
    "Accept-Ranges": "bytes",
    ETag: etag,
  };
  if (request.headers.get("If-None-Match") === etag) {
    return new Response(null, { status: 304, headers });
  }

  const size = parsed.bytes.length;
  // ponytail: single byte range only; multi-range requests fall back to the full body.
  const range = /^bytes=(\d+)-(\d*)$/.exec(request.headers.get("Range") ?? "");
  if (range) {
    const start = Number(range[1]);
    if (start >= size) {
      return new Response(null, { status: 416, headers: { ...headers, "Content-Range": `bytes */${size}` } });
    }
    // Vercel rejects non-streamed responses over 4.5 MB; players request the next chunk on their own.
    const end = Math.min(range[2] ? Number(range[2]) : size - 1, size - 1, start + MAX_CHUNK - 1);
    if (end >= start) {
      // Copies at most MAX_CHUNK bytes; Response's BodyInit type does not accept a Buffer view.
      return new Response(Uint8Array.from(parsed.bytes.subarray(start, end + 1)), {
        status: 206,
        headers: {
          ...headers,
          "Content-Range": `bytes ${start}-${end}/${size}`,
          "Content-Length": String(end - start + 1),
        },
      });
    }
  }
  // Streamed, so a full download is not subject to Vercel's 4.5 MB buffered-response limit.
  let offset = 0;
  const body = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (offset >= size) return controller.close();
      controller.enqueue(parsed.bytes.subarray(offset, offset + MAX_CHUNK));
      offset += MAX_CHUNK;
    },
  });
  return new Response(body, { headers: { ...headers, "Content-Length": String(size) } });
}
