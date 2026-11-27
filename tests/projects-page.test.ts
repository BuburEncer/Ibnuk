import { expect, test } from "vitest";

test("projects page renders separate database-error and empty states", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(
    new URL("../app/projects/page.tsx", import.meta.url),
    "utf8",
  );
  expect(source).toContain("/projects");
  expect(source).toContain("AI/ML");
  expect(source).toContain("Software");
  expect(source).toContain("Other");
  expect(source).toContain("Could not load projects. Please try again later.");
  expect(source).toContain("No projects yet.");
});

test("list titles link to the detail page", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../app/projects/page.tsx", import.meta.url), "utf8");
  expect(source).toMatch(/href=\{`\/projects\/\$\{project\.id\}`\}/);
});

test("detail page 404s unknown ids and hides DB errors", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../app/projects/[id]/page.tsx", import.meta.url), "utf8");
  expect(source).toContain("parseProjectId");
  expect(source).toContain("notFound()");
  expect(source).toContain("Could not load projects. Please try again later.");
});

test("detail page renders a lazy gallery with captions", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../app/projects/[id]/page.tsx", import.meta.url), "utf8");
  expect(source).toContain("listGallery");
  expect(source).toContain('loading="lazy"');
  expect(source).toContain("<figcaption>");
});

test("admin gallery thumbnails load from the image route", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../app/admin/gallery-admin.tsx", import.meta.url), "utf8");
  expect(source).toContain("/images/");
  expect(source).not.toContain("img.image");
});

test("project queries return media flags instead of media bytes", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../lib/projects.ts", import.meta.url), "utf8");
  expect(source).toContain("hasImage");
  expect(source).toContain("hasVideo");
  expect(source).not.toMatch(/\.select\(\)\s*\.from\(projects\)/);
});

test.each(["../app/projects/page.tsx", "../app/projects/[id]/page.tsx", "../app/admin/admin-actions.tsx"])(
  "%s loads main media from the media route",
  async (path) => {
    const { readFile } = await import("node:fs/promises");
    const source = await readFile(new URL(path, import.meta.url), "utf8");
    expect(source).toContain("/media/image");
    expect(source).toContain("/media/video");
    expect(source).not.toMatch(/src=\{project\.(image|video)\}/);
  },
);
