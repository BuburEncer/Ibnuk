import { describe, it, expect } from "vitest";
import { getTableConfig } from "drizzle-orm/pg-core";
import { projectImages, projects } from "../db/schema";

describe("projects schema", () => {
  it("exposes expected columns", () => {
    expect(projects.title.notNull).toBe(true);
    expect(projects.link).toBeDefined();
    expect(projects.createdAt).toBeDefined();
  });
});

describe("project_images schema", () => {
  it("requires project, image and caption and cascades on project delete", () => {
    const config = getTableConfig(projectImages);
    expect(config.name).toBe("project_images");
    expect(projectImages.projectId.notNull).toBe(true);
    expect(projectImages.image.notNull).toBe(true);
    expect(projectImages.caption.notNull).toBe(true);
    expect(projectImages.createdAt).toBeDefined();
    const [fk] = config.foreignKeys;
    expect(fk.reference().foreignTable).toBe(projects);
    expect(fk.onDelete).toBe("cascade");
  });
});
