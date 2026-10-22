import { beforeEach, describe, expect, it, vi } from "vitest";

const insertValues = vi.fn();
const updateSet = vi.fn();
const updateWhere = vi.fn();
const updateReturning = vi.fn();
const selectWhere = vi.fn();
const selectLimit = vi.fn();
const selectFrom = vi.fn();
const select = vi.fn();
const redirect = vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});

vi.mock("next/navigation", () => ({ redirect }));
vi.mock("../lib/auth", () => ({ checkPassword: () => true }));
vi.mock("../lib/db", () => ({
  db: {
    insert: () => ({ values: insertValues }),
    update: () => ({ set: updateSet }),
    select,
  },
}));
vi.mock("../db/schema", () => ({ projects: { id: "id" } }));

beforeEach(() => {
  vi.clearAllMocks();
  insertValues.mockResolvedValue(undefined);
  updateSet.mockReturnValue({ where: updateWhere });
  updateWhere.mockReturnValue({ returning: updateReturning });
  updateReturning.mockResolvedValue([{ id: 1 }]);
  select.mockReturnValue({ from: selectFrom });
  selectFrom.mockReturnValue({ where: selectWhere });
  selectWhere.mockReturnValue({ limit: selectLimit });
  selectLimit.mockResolvedValue([{ id: 1 }]);
});

function form(fields: Record<string, string>) {
  const data = new FormData();
  Object.entries(fields).forEach(([key, value]) => data.set(key, value));
  return data;
}

const valid = {
  password: "secret",
  title: "Project",
  link: "https://github.com/example/project",
  source: "github",
  category: "software",
  imagePath: "/projects/demo.png",
};

async function loadActions() {
  return import("../app/actions/projects");
}

describe("project write validation", () => {
  it("rejects unsupported source before insert", async () => {
    const { createProject } = await loadActions();
    await expect(createProject(form({ ...valid, source: "gitlab" }))).rejects.toThrow(
      "REDIRECT:/admin?error=invalid",
    );
    expect(insertValues).not.toHaveBeenCalled();
  });

  it("rejects unsupported category before insert", async () => {
    const { createProject } = await loadActions();
    await expect(createProject(form({ ...valid, category: "other" }))).rejects.toThrow(
      "REDIRECT:/admin?error=invalid",
    );
    expect(insertValues).not.toHaveBeenCalled();
  });

  it("rejects external image path before insert", async () => {
    const { createProject } = await loadActions();
    await expect(
      createProject(form({ ...valid, imagePath: "https://evil.test/p.png" })),
    ).rejects.toThrow("REDIRECT:/admin?error=invalid");
    expect(insertValues).not.toHaveBeenCalled();
  });

  it("stores optional metadata and empty image path as null", async () => {
    const { createProject } = await loadActions();
    await expect(
      createProject(form({ ...valid, imagePath: "", link: "" })),
    ).rejects.toThrow("REDIRECT:/projects");
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Project",
        source: "github",
        category: "software",
        imagePath: null,
        link: null,
      }),
    );
  });
});

describe("project update validation", () => {
  it("rejects unsupported source before update", async () => {
    const { updateProject } = await loadActions();
    await expect(
      updateProject(form({ ...valid, id: "1", source: "gitlab" })),
    ).rejects.toThrow("REDIRECT:/admin?error=invalid");
    expect(updateSet).not.toHaveBeenCalled();
  });

  it("rejects an invalid id before update", async () => {
    const { updateProject } = await loadActions();
    await expect(
      updateProject(form({ ...valid, id: "not-a-number" })),
    ).rejects.toThrow("REDIRECT:/admin?error=invalid");
    expect(updateSet).not.toHaveBeenCalled();
  });

  it("keeps existing metadata when updating a legacy row", async () => {
    const { updateProject } = await loadActions();
    await expect(
      updateProject(form({ ...valid, id: "1", source: "kaggle", category: "ai" })),
    ).rejects.toThrow("REDIRECT:/projects");
    expect(updateSet).toHaveBeenCalledWith(
      expect.objectContaining({ source: "kaggle", category: "ai" }),
    );
  });
});
