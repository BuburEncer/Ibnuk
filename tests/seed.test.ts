import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { projectEntries, seedProjects } from "../scripts/seed.mjs";

describe("curated project seed", () => {
  it("includes the approved project set with unique categorized links", () => {
    const links = projectEntries.map((project) => project.link);
    expect(projectEntries).toHaveLength(15);
    expect(projectEntries.some((project) => project.link?.includes("genre-cnn"))).toBe(false);
    expect(projectEntries.every((project) => project.link)).toBe(true);
    expect(new Set(links).size).toBe(projectEntries.length);
    expect(projectEntries.every((project) => ["github", "kaggle"].includes(project.source))).toBe(true);
    expect(projectEntries.every((project) => ["ai", "software"].includes(project.category))).toBe(true);
    expect(projectEntries.every((project) => project.image === null)).toBe(true);
  });

  it("inserts linked projects once and skips empty links", async () => {
    const stored = new Set<string>();
    const sql = async (strings: TemplateStringsArray, ...values: unknown[]) => {
      if (strings[0].includes("SELECT")) {
        return stored.has(String(values[0])) ? [{ id: 1 }] : [];
      }
      if (strings[0].includes("INSERT")) {
        stored.add(String(values[3]));
        return [];
      }
      throw new Error("Unexpected SQL");
    };
    const entries = [
      {
        title: "One",
        link: "https://github.com/example/one",
        source: "github",
        category: "software",
      },
      { title: "No link", link: null },
    ];

    expect(await seedProjects(sql, entries)).toBe(1);
    expect(await seedProjects(sql, entries)).toBe(0);
    expect(stored.size).toBe(1);
  });

  it.each([
    { source: "github", category: null, link: "https://github.com/example/one" },
    { source: null, category: "software", link: "https://github.com/example/two" },
    { source: "github", category: "software", link: "javascript:alert(1)" },
  ])("rejects invalid source/category/link before DB query: $source/$category", async (invalid) => {
    const sql = async () => {
      throw new Error("Database query should not run");
    };
    await expect(
      seedProjects(sql, [{ title: "Invalid", ...invalid }]),
    ).rejects.toThrow("Invalid curated project");
  });

  it("executes seed main when run from npm", () => {
    expect(() =>
      execFileSync("node", ["scripts/seed.mjs"], {
        env: {
          ...process.env,
          DATABASE_URL: "postgres://invalid:invalid@127.0.0.1:1/test",
        },
        stdio: "pipe",
        timeout: 5000,
      }),
    ).toThrow();
  });
});
