import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const page = readFileSync(new URL("../app/projects/page.tsx", import.meta.url), "utf8");
const admin = readFileSync(new URL("../app/admin/page.tsx", import.meta.url), "utf8");
const seed = readFileSync(new URL("../scripts/seed.mjs", import.meta.url), "utf8");

describe("accessible metadata color", () => {
  it("does not use #777 for body text", () => {
    expect(css).not.toMatch(/color:\s*#777/);
  });
});

describe("project link labels", () => {
  it("renders one labelled link per stored URL", () => {
    expect(page).toContain("platformLabel");
    expect(page).toMatch(/\[project\.link, project\.link2\]/);
  });
});

describe("admin list state", () => {
  it("surfaces a database failure message", () => {
    expect(admin).toContain("Could not load the project list");
  });
});

describe("seed node compatibility", () => {
  it("guards process.loadEnvFile for older node versions", () => {
    expect(seed).toMatch(/typeof process\.loadEnvFile/);
  });
});

describe("admin gallery", () => {
  it("wires add, caption edit and delete with the shared password", () => {
    const gallery = readFileSync(new URL("../app/admin/gallery-admin.tsx", import.meta.url), "utf8");
    expect(gallery).toContain("addProjectImage");
    expect(gallery).toContain("updateProjectImageCaption");
    expect(gallery).toContain("deleteProjectImage");
    expect(gallery).toContain("HiddenPassword");
    expect(gallery).toMatch(/name="caption"[^>]*required/);
  });
});

describe("gallery failure states", () => {
  const detail = readFileSync(new URL("../app/projects/[id]/page.tsx", import.meta.url), "utf8");
  const gallery = readFileSync(new URL("../app/admin/gallery-admin.tsx", import.meta.url), "utf8");

  it("tells visitors when the gallery could not load", () => {
    expect(detail).toContain("Could not load the gallery. Please try again later.");
  });

  it("tells the admin when the gallery could not load", () => {
    expect(admin).toContain("Could not load the gallery");
  });

  it("explains a missing or too long caption", () => {
    expect(admin).toMatch(/caption: "Caption is required \(max 500 characters\)\."/);
  });

  it("disables the add button while an upload is pending", () => {
    expect(gallery).toContain("useTransition");
    expect(gallery).toMatch(/disabled=\{isPending\}/);
  });
});
