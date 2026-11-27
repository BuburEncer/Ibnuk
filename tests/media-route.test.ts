import { beforeEach, describe, expect, it, vi } from "vitest";

const limit = vi.fn();
const where = vi.fn(() => ({ limit }));
const select = vi.fn(() => ({ from: () => ({ where }) }));

vi.mock("../lib/db", () => ({ db: { select } }));
vi.mock("../db/schema", () => ({
  projects: { id: "projects.id", image: "projects.image", video: "projects.video" },
  projectImages: { id: "images.id" },
}));

const { GET } = await import("../app/projects/[id]/media/[kind]/route");

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const MP4 = Buffer.from([0, 0, 0, 0x18, 0x66, 0x74, 0x79, 0x70, 1, 2]);

function get(id: string, kind: string, headers: Record<string, string> = {}) {
  return GET(new Request("http://localhost/x", { headers }), {
    params: Promise.resolve({ id, kind }),
  });
}

function stored(media: string | null) {
  limit.mockResolvedValue([{ media }]);
}

beforeEach(() => {
  vi.clearAllMocks();
  stored(`data:image/png;base64,${PNG.toString("base64")}`);
});

describe("main media route", () => {
  it("serves the image with revalidation headers and an ETag", async () => {
    const res = await get("1", "image");
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/png");
    expect(res.headers.get("Cache-Control")).toBe("no-cache");
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(res.headers.get("ETag")).toMatch(/^"[0-9a-f]{16}"$/);
    expect(Buffer.from(await res.arrayBuffer()).equals(PNG)).toBe(true);
    expect(select).toHaveBeenCalledWith({ media: "projects.image" });
  });

  it("returns 304 without a body when the ETag matches", async () => {
    const etag = (await get("1", "image")).headers.get("ETag")!;
    const res = await get("1", "image", { "If-None-Match": etag });
    expect(res.status).toBe(304);
    expect(await res.text()).toBe("");
  });

  it("changes the ETag when the stored image is replaced", async () => {
    const first = (await get("1", "image")).headers.get("ETag");
    stored(`data:image/png;base64,${Buffer.concat([PNG, Buffer.from([9])]).toString("base64")}`);
    const second = (await get("1", "image")).headers.get("ETag");
    expect(second).not.toBe(first);
  });

  describe("video", () => {
    beforeEach(() => stored(`data:video/mp4;base64,${MP4.toString("base64")}`));

    it("reads the video column and advertises range support", async () => {
      const res = await get("1", "video");
      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Type")).toBe("video/mp4");
      expect(res.headers.get("Accept-Ranges")).toBe("bytes");
      expect(select).toHaveBeenCalledWith({ media: "projects.video" });
    });

    it("answers a closed range with 206", async () => {
      const res = await get("1", "video", { Range: "bytes=0-3" });
      expect(res.status).toBe(206);
      expect(res.headers.get("Content-Range")).toBe(`bytes 0-3/${MP4.length}`);
      expect(res.headers.get("Content-Length")).toBe("4");
      expect(Buffer.from(await res.arrayBuffer()).equals(MP4.subarray(0, 4))).toBe(true);
    });

    it("answers an open range to the end", async () => {
      const res = await get("1", "video", { Range: "bytes=4-" });
      expect(res.status).toBe(206);
      expect(res.headers.get("Content-Range")).toBe(`bytes 4-${MP4.length - 1}/${MP4.length}`);
      expect(Buffer.from(await res.arrayBuffer()).equals(MP4.subarray(4))).toBe(true);
    });

    it("clamps a range end past the last byte", async () => {
      const res = await get("1", "video", { Range: "bytes=2-999" });
      expect(res.status).toBe(206);
      expect(res.headers.get("Content-Range")).toBe(`bytes 2-${MP4.length - 1}/${MP4.length}`);
    });

    it("rejects a range that starts past the end with 416", async () => {
      const res = await get("1", "video", { Range: `bytes=${MP4.length}-` });
      expect(res.status).toBe(416);
      expect(res.headers.get("Content-Range")).toBe(`bytes */${MP4.length}`);
    });

    it("ignores a malformed range and sends the whole file", async () => {
      const res = await get("1", "video", { Range: "bytes=abc" });
      expect(res.status).toBe(200);
      expect(Buffer.from(await res.arrayBuffer()).equals(MP4)).toBe(true);
    });
  });

  it.each([
    ["1", "title"],
    ["1", "description"],
    ["abc", "image"],
    ["0", "video"],
  ])("returns 404 without querying for %s/%s", async (id, kind) => {
    expect((await get(id, kind)).status).toBe(404);
    expect(select).not.toHaveBeenCalled();
  });

  it.each([
    ["missing column value", null],
    ["legacy non-data-URL", "/projects/old.png"],
    ["wrong family", "data:text/html;base64,PGgxPg=="],
  ])("returns 404 for a %s", async (_label, value) => {
    stored(value);
    expect((await get("1", "image")).status).toBe(404);
  });

  it("returns 404 when the project does not exist", async () => {
    limit.mockResolvedValue([]);
    expect((await get("1", "image")).status).toBe(404);
  });

  it("does not serve an image stored in the video column", async () => {
    stored(`data:image/png;base64,${PNG.toString("base64")}`);
    expect((await get("1", "video")).status).toBe(404);
  });

  it("returns 503 with a plain message when the DB fails", async () => {
    limit.mockRejectedValue(new Error("connection refused"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await get("1", "image");
    expect(res.status).toBe(503);
    expect(await res.text()).toBe("Could not load media");
  });
});
