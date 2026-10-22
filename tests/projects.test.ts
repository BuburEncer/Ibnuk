import { describe, it, expect } from "vitest";
import { groupProjects, getProjectListState } from "../lib/projects";

describe("groupProjects", () => {
  it("splits projects into ai, software and other", () => {
    const rows = [
      { category: "ai" as const, title: "AI" },
      { category: "software" as const, title: "App" },
      { category: null, title: "Legacy" },
    ];
    expect(groupProjects(rows)).toEqual({
      ai: [rows[0]],
      software: [rows[1]],
      other: [rows[2]],
    });
  });
  it("keeps rows with an unknown category in other", () => {
    const rows = [{ category: "data" as const, title: "Odd" }];
    expect(groupProjects(rows).other).toEqual(rows);
  });
  it("returns empty groups for no rows", () => {
    expect(groupProjects([])).toEqual({ ai: [], software: [], other: [] });
  });
  it("preserves input order inside each group", () => {
    const rows = [
      { category: "ai" as const, title: "first" },
      { category: "ai" as const, title: "second" },
    ];
    expect(groupProjects(rows).ai.map((p) => p.title)).toEqual([
      "first",
      "second",
    ]);
  });
});

describe("project list states", () => {
  it("distinguishes database failure from empty results", () => {
    expect(getProjectListState({ projects: [], failed: true })).toBe("error");
  });
  it("identifies empty successful results", () => {
    expect(getProjectListState({ projects: [], failed: false })).toBe("empty");
  });
});
