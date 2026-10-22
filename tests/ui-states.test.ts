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

describe("project source label", () => {
  it("renders the source paragraph only for known sources", () => {
    expect(page).toMatch(/project\.source && \(/);
  });
});

describe("admin list state", () => {
  it("surfaces a database failure message", () => {
    expect(admin).toContain("Gagal memuat daftar proyek");
  });
});

describe("seed node compatibility", () => {
  it("guards process.loadEnvFile for older node versions", () => {
    expect(seed).toMatch(/typeof process\.loadEnvFile/);
  });
});
