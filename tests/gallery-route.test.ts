import { beforeEach, describe, expect, it, vi } from "vitest";

const limit = vi.fn();
const where = vi.fn(() => ({ limit }));

vi.mock("drizzle-orm", async (importOriginal) => ({
  ...(await importOriginal<typeof import("drizzle-orm")>()),
  eq: (column: unknown, value: unknown) => ["eq", column, value],
  and: (...conditions: unknown[]) => ["and", ...conditions],
}));
vi.mock("../lib/db", () => ({
  db: { select: () => ({ from: () => ({ where }) }) },
}));
vi.mock("../db/schema", () => ({
  projects: { id: "projects.id" },
  projectImages: { id: "images.id", projectId: "images.project_id", image: "images.image" },
}));

const { GET } = await import("../app/projects/[id]/images/[imageId]/route");

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function get(id: string, imageId: string) {
  return GET(new Request("http://localhost/x"), { params: Promise.resolve({ id, imageId }) });
}

beforeEach(() => {
  vi.clearAllMocks();
  limit.mockResolvedValue([{ image: `data:image/png;base64,${PNG.toString("base64")}` }]);
});

describe("gallery image route", () => {
  it("serves the bytes with a short public cache and nosniff", async () => {
    const res = await get("19", "2");
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/png");
    expect(res.headers.get("Cache-Control")).toBe("public, max-age=3600");
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(Buffer.from(await res.arrayBuffer()).equals(PNG)).toBe(true);
  });

  it("filters on both the project id and the image id", async () => {
    await get("19", "2");
    expect(where).toHaveBeenCalledWith([
      "and",
      ["eq", "images.project_id", 19],
      ["eq", "images.id", 2],
    ]);
  });

  it("returns 404 when no row matches (unknown or other project's image)", async () => {
    limit.mockResolvedValue([]);
    expect((await get("1", "2")).status).toBe(404);
  });

  it.each([
    ["abc", "2"],
    ["19", "abc"],
    ["0", "2"],
    ["19", "2147483648"],
  ])("returns 404 without querying for ids %s/%s", async (id, imageId) => {
    expect((await get(id, imageId)).status).toBe(404);
    expect(where).not.toHaveBeenCalled();
  });

  it("does not serve a stored value that is not an allowed image data URL", async () => {
    limit.mockResolvedValue([{ image: "data:text/html;base64,PGgxPg==" }]);
    expect((await get("19", "2")).status).toBe(404);
  });

  it("returns 503 with a plain message when the DB fails", async () => {
    limit.mockRejectedValue(new Error("connection refused"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await get("19", "2");
    expect(res.status).toBe(503);
    expect(await res.text()).toBe("Could not load image");
  });
});
