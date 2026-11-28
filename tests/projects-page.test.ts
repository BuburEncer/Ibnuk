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
  expect(source).toContain("<GalleryCarousel");
  const carousel = await readFile(new URL("../app/projects/gallery-carousel.tsx", import.meta.url), "utf8");
  expect(carousel).toContain('loading="lazy"');
  expect(carousel).toContain("<figcaption>");
  // Slides scroll sideways, so keyboard users must be able to focus the track.
  expect(carousel).toContain("tabIndex={0}");
  expect(carousel).toContain('aria-label="Next image"');
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
  expect(source).toContain("^data:image/(png|jpeg|webp|gif);base64,");
  expect(source).toContain("^data:video/(mp4|webm);base64,");
  expect(source).not.toMatch(/export type Project = \{/);
});

test("admin project type is derived, not a hand-written copy", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../app/admin/admin-actions.tsx", import.meta.url), "utf8");
  expect(source).not.toMatch(/type Project = \{/);
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
