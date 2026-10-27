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

function form(fields: Record<string, string | File>) {
  const data = new FormData();
  Object.entries(fields).forEach(([key, value]) => data.set(key, value));
  return data;
}

function imageFile(
  bytes: Uint8Array,
  name: string,
  type: string,
): File {
  return new File([bytes], name, { type });
}

const valid = {
  password: "secret",
  title: "Project",
  link: "https://github.com/example/project",
  category: "software",
};

async function loadActions() {
  return import("../app/actions/projects");
}

describe("project write validation", () => {
  it("rejects a link from an unsupported host before insert", async () => {
    const { createProject } = await loadActions();
    await expect(
      createProject(form({ ...valid, link: "https://gitlab.com/example/project" })),
    ).rejects.toThrow("REDIRECT:/admin?error=invalid");
    expect(insertValues).not.toHaveBeenCalled();
  });

  it("rejects unsupported category before insert", async () => {
    const { createProject } = await loadActions();
    await expect(createProject(form({ ...valid, category: "other" }))).rejects.toThrow(
      "REDIRECT:/admin?error=invalid",
    );
    expect(insertValues).not.toHaveBeenCalled();
  });

  it("stores optional metadata and missing image as null", async () => {
    const { createProject } = await loadActions();
    await expect(
      createProject(form({ ...valid, link: "" })),
    ).rejects.toThrow("REDIRECT:/projects");
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Project",
        source: "github",
        category: "software",
        image: null,
        link: null,
      }),
    );
  });

  it("stores a second link when provided", async () => {
    const { createProject } = await loadActions();
    await expect(
      createProject(form({ ...valid, link2: "https://kaggle.com/code/example/two" })),
    ).rejects.toThrow("REDIRECT:/projects");
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ link2: "https://kaggle.com/code/example/two" }),
    );
  });

  it("rejects an invalid second link before insert", async () => {
    const { createProject } = await loadActions();
    await expect(
      createProject(form({ ...valid, link2: "javascript:alert(1)" })),
    ).rejects.toThrow("REDIRECT:/admin?error=invalid");
    expect(insertValues).not.toHaveBeenCalled();
  });

  it("stores uploaded video as a data URL", async () => {
    const { createProject } = await loadActions();
    // ISO BMFF header: box size (4 bytes) + "ftyp" at offset 4 + brand bytes.
    const videoBytes = new Uint8Array([
      0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x6d, 0x70, 0x34, 0x32,
    ]);
    const video = new File([videoBytes], "demo.mp4", { type: "video/mp4" });
    await expect(createProject(form({ ...valid, video }))).rejects.toThrow(
      "REDIRECT:/projects",
    );
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        video: `data:video/mp4;base64,${Buffer.from(videoBytes).toString("base64")}`,
      }),
    );
  });

  it("rejects a video whose bytes do not match its declared type", async () => {
    const { createProject } = await loadActions();
    const fake = new File(["not video"], "bad.mp4", { type: "video/mp4" });
    await expect(createProject(form({ ...valid, video: fake }))).rejects.toThrow(
      "REDIRECT:/admin?error=video-type",
    );
    expect(insertValues).not.toHaveBeenCalled();
  });

  it("rejects videos larger than 20MB before insert", async () => {
    const { createProject } = await loadActions();
    const big = new File([new Uint8Array(20 * 1024 * 1024 + 1)], "big.mp4", {
      type: "video/mp4",
    });
    await expect(createProject(form({ ...valid, video: big }))).rejects.toThrow(
      "REDIRECT:/admin?error=video-too-large",
    );
    expect(insertValues).not.toHaveBeenCalled();
  });

  it("keeps the stored video when no new file is uploaded", async () => {
    const { updateProject } = await loadActions();
    await expect(updateProject(form({ ...valid, id: "1" }))).rejects.toThrow(
      "REDIRECT:/projects",
    );
    expect(updateSet.mock.calls[0][0].video).toBeUndefined();
  });

  it("clears the stored video when removeVideo is checked", async () => {
    const { updateProject } = await loadActions();
    await expect(
      updateProject(form({ ...valid, id: "1", removeVideo: "on" })),
    ).rejects.toThrow("REDIRECT:/projects");
    expect(updateSet).toHaveBeenCalledWith(expect.objectContaining({ video: null }));
  });

  it("stores uploaded image as a data URL", async () => {
    const { createProject } = await loadActions();
    const pngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]);
    const png = imageFile(pngBytes, "demo.png", "image/png");
    await expect(createProject(form({ ...valid, image: png }))).rejects.toThrow(
      "REDIRECT:/projects",
    );
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        image: `data:image/png;base64,${Buffer.from(pngBytes).toString("base64")}`,
      }),
    );
  });

  it("rejects an image whose bytes do not match its declared type", async () => {
    const { createProject } = await loadActions();
    const fake = imageFile(new TextEncoder().encode("<svg/>"), "x.png", "image/png");
    await expect(createProject(form({ ...valid, image: fake }))).rejects.toThrow(
      "REDIRECT:/admin?error=image-type",
    );
    expect(insertValues).not.toHaveBeenCalled();
  });

  it("rejects an image larger than 2MB before insert", async () => {
    const { createProject } = await loadActions();
    const big = imageFile(
      new Uint8Array(2 * 1024 * 1024 + 1),
      "big.png",
      "image/png",
    );
    await expect(createProject(form({ ...valid, image: big }))).rejects.toThrow(
      "REDIRECT:/admin?error=image-too-large",
    );
    expect(insertValues).not.toHaveBeenCalled();
  });

  it("rejects a disallowed image type before insert", async () => {
    const { createProject } = await loadActions();
    const svg = imageFile(new TextEncoder().encode("<svg/>"), "x.svg", "image/svg+xml");
    await expect(createProject(form({ ...valid, image: svg }))).rejects.toThrow(
      "REDIRECT:/admin?error=image-type",
    );
    expect(insertValues).not.toHaveBeenCalled();
  });
});

describe("project update validation", () => {
  it("rejects a link from an unsupported host before update", async () => {
    const { updateProject } = await loadActions();
    await expect(
      updateProject(form({ ...valid, id: "1", link: "https://gitlab.com/example/project" })),
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

  it("derives source from the primary link platform on update", async () => {
    const { updateProject } = await loadActions();
    await expect(
      updateProject(
        form({
          ...valid,
          id: "1",
          link: "https://www.kaggle.com/code/example/notebook",
          category: "ai",
        }),
      ),
    ).rejects.toThrow("REDIRECT:/projects");
    expect(updateSet).toHaveBeenCalledWith(
      expect.objectContaining({ source: "kaggle", category: "ai" }),
    );
  });

  it("keeps the stored image when no new file is uploaded", async () => {
    const { updateProject } = await loadActions();
    await expect(updateProject(form({ ...valid, id: "1" }))).rejects.toThrow(
      "REDIRECT:/projects",
    );
    expect(updateSet.mock.calls[0][0].image).toBeUndefined();
  });

  it("clears the stored image when removeImage is checked", async () => {
    const { updateProject } = await loadActions();
    await expect(
      updateProject(form({ ...valid, id: "1", removeImage: "on" })),
    ).rejects.toThrow("REDIRECT:/projects");
    expect(updateSet).toHaveBeenCalledWith(expect.objectContaining({ image: null }));
  });

  it("replaces the stored image when a new file is uploaded", async () => {
    const { updateProject } = await loadActions();
    const pngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]);
    const png = imageFile(pngBytes, "new.png", "image/png");
    await expect(
      updateProject(form({ ...valid, id: "1", image: png })),
    ).rejects.toThrow("REDIRECT:/projects");
    expect(updateSet).toHaveBeenCalledWith(
      expect.objectContaining({
        image: `data:image/png;base64,${Buffer.from(pngBytes).toString("base64")}`,
      }),
    );
  });
});
