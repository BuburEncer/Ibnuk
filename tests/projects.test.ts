import { describe, it, expect, beforeAll } from "vitest";

beforeAll(() => {
  process.env.DATABASE_URL = "postgres://placeholder:placeholder@localhost:5432/ibnuk";
});

describe("listProjects", () => {
  it("returns array of projects", async () => {
    const { listProjects } = await import("../lib/projects");
    const result = await listProjects();
    expect(Array.isArray(result)).toBe(true);
  });
});
