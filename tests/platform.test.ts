import { describe, expect, it } from "vitest";
import { platformLabel, orderedLinks } from "../lib/platform";

describe("orderedLinks", () => {
  it("puts GitHub first, Kaggle second, others after", () => {
    const links = orderedLinks([
      "https://www.kaggle.com/code/example/a",
      "https://github.com/example/b",
      "https://example.com/c",
    ]);
    expect(links).toEqual([
      "https://github.com/example/b",
      "https://www.kaggle.com/code/example/a",
      "https://example.com/c",
    ]);
  });

  it("drops nulls", () => {
    expect(orderedLinks([null, "https://github.com/example/b"])).toEqual([
      "https://github.com/example/b",
    ]);
  });
});

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
