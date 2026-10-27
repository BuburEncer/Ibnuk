import { describe, expect, it } from "vitest";
import { platformLabel } from "../lib/platform";

describe("platformLabel", () => {
  it("labels GitHub and Kaggle hosts", () => {
    expect(platformLabel("https://github.com/BuburEncer/fake-face-detector")).toBe("GitHub");
    expect(platformLabel("https://www.kaggle.com/code/ibnuqayyim/demo")).toBe("Kaggle");
  });

  it("falls back to a generic label for unknown or invalid hosts", () => {
    expect(platformLabel("https://example.com/demo")).toBe("Buka proyek");
    expect(platformLabel("not-a-url")).toBe("Buka proyek");
  });
});
