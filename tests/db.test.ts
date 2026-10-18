import { describe, it, expect } from "vitest";
import { projects } from "../db/schema";

describe("projects schema", () => {
  it("exposes expected columns", () => {
    expect(projects.title.notNull).toBe(true);
    expect(projects.link).toBeDefined();
    expect(projects.createdAt).toBeDefined();
  });
});
