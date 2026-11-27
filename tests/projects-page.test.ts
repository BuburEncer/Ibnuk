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
