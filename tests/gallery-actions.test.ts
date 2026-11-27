import { beforeEach, describe, expect, it, vi } from "vitest";

const insertValues = vi.fn();
const updateSet = vi.fn();
const updateWhere = vi.fn();
const deleteWhere = vi.fn();
const checkPassword = vi.fn();
const redirect = vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});

vi.mock("next/navigation", () => ({ redirect }));
vi.mock("../lib/auth", () => ({ checkPassword }));
vi.mock("../lib/db", () => ({
  db: {
    insert: () => ({ values: insertValues }),
    update: () => ({ set: updateSet }),
    delete: () => ({ where: deleteWhere }),
  },
}));
vi.mock("../db/schema", () => ({
  projects: { id: "id" },
  projectImages: { id: "image_id" },
}));

const { addProjectImage, updateProjectImageCaption, deleteProjectImage } = await import(
  "../app/actions/projects"
);

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function form(fields: Record<string, string | File>) {
  const data = new FormData();
  Object.entries(fields).forEach(([key, value]) => data.set(key, value));
  return data;
}

function png(bytes: Uint8Array<ArrayBuffer> = PNG) {
  return new File([bytes], "shot.png", { type: "image/png" });
}

beforeEach(() => {
  vi.clearAllMocks();
  checkPassword.mockReturnValue(true);
  insertValues.mockResolvedValue(undefined);
  updateSet.mockReturnValue({ where: updateWhere });
  updateWhere.mockResolvedValue(undefined);
  deleteWhere.mockResolvedValue(undefined);
});

describe("addProjectImage", () => {
  const valid = () => ({ password: "secret", projectId: "3", caption: "  Login screen  ", image: png() });

  it("stores the image as a data URL with a trimmed caption", async () => {
    await expect(addProjectImage(form(valid()))).rejects.toThrow("REDIRECT:/admin");
    expect(insertValues).toHaveBeenCalledWith({
      projectId: 3,
      caption: "Login screen",
      image: `data:image/png;base64,${Buffer.from(PNG).toString("base64")}`,
    });
  });

  it("rejects a wrong password before any DB write", async () => {
    checkPassword.mockReturnValue(false);
    await expect(addProjectImage(form(valid()))).rejects.toThrow("REDIRECT:/admin?error=invalid");
    expect(insertValues).not.toHaveBeenCalled();
  });

  it.each(["", "   ", "x".repeat(501)])("rejects caption %j with a caption error", async (caption) => {
    await expect(addProjectImage(form({ ...valid(), caption }))).rejects.toThrow(
      "REDIRECT:/admin?error=caption",
    );
    expect(insertValues).not.toHaveBeenCalled();
  });

  it("accepts a caption of exactly 500 characters", async () => {
    await expect(addProjectImage(form({ ...valid(), caption: "x".repeat(500) }))).rejects.toThrow(
      "REDIRECT:/admin",
    );
    expect(insertValues).toHaveBeenCalledOnce();
  });

  it.each(["abc", "0", "1.5", ""])("rejects projectId %j", async (projectId) => {
    await expect(addProjectImage(form({ ...valid(), projectId }))).rejects.toThrow(
      "REDIRECT:/admin?error=invalid",
    );
    expect(insertValues).not.toHaveBeenCalled();
  });

  it("rejects a missing file", async () => {
    const { image: _, ...rest } = valid();
    await expect(addProjectImage(form(rest))).rejects.toThrow("REDIRECT:/admin?error=invalid");
    expect(insertValues).not.toHaveBeenCalled();
  });

  it("rejects bytes that do not match the declared type", async () => {
    const fake = new File([new TextEncoder().encode("<svg/>")], "x.png", { type: "image/png" });
    await expect(addProjectImage(form({ ...valid(), image: fake }))).rejects.toThrow(
      "REDIRECT:/admin?error=image-type",
    );
    expect(insertValues).not.toHaveBeenCalled();
  });

  it("rejects images over 2 MB", async () => {
    const big = new Uint8Array(2 * 1024 * 1024 + 1);
    big.set(PNG);
    await expect(addProjectImage(form({ ...valid(), image: png(big) }))).rejects.toThrow(
      "REDIRECT:/admin?error=image-too-large",
    );
    expect(insertValues).not.toHaveBeenCalled();
  });
});

describe("updateProjectImageCaption", () => {
  it("updates the trimmed caption", async () => {
    await expect(
      updateProjectImageCaption(form({ password: "secret", id: "7", caption: " New " })),
    ).rejects.toThrow("REDIRECT:/admin");
    expect(updateSet).toHaveBeenCalledWith({ caption: "New" });
  });

  it.each(["  ", "x".repeat(501)])("rejects caption %j with a caption error", async (caption) => {
    await expect(
      updateProjectImageCaption(form({ password: "secret", id: "7", caption })),
    ).rejects.toThrow("REDIRECT:/admin?error=caption");
    expect(updateSet).not.toHaveBeenCalled();
  });

  it("rejects a wrong password", async () => {
    checkPassword.mockReturnValue(false);
    await expect(
      updateProjectImageCaption(form({ password: "x", id: "7", caption: "New" })),
    ).rejects.toThrow("REDIRECT:/admin?error=invalid");
    expect(updateSet).not.toHaveBeenCalled();
  });
});

describe("deleteProjectImage", () => {
  it("deletes the image", async () => {
    await expect(deleteProjectImage(form({ password: "secret", id: "7" }))).rejects.toThrow(
      "REDIRECT:/admin",
    );
    expect(deleteWhere).toHaveBeenCalledOnce();
  });

  it("rejects a wrong password", async () => {
    checkPassword.mockReturnValue(false);
    await expect(deleteProjectImage(form({ password: "x", id: "7" }))).rejects.toThrow(
      "REDIRECT:/admin?error=invalid",
    );
    expect(deleteWhere).not.toHaveBeenCalled();
  });

  it("rejects a non-numeric id", async () => {
    await expect(deleteProjectImage(form({ password: "secret", id: "abc" }))).rejects.toThrow(
      "REDIRECT:/admin?error=invalid",
    );
    expect(deleteWhere).not.toHaveBeenCalled();
  });
});
