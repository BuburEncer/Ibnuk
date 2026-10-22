import { describe, it, expect } from "vitest";
import {
  isValidLink,
  isValidProjectSource,
  isValidProjectCategory,
  isValidProjectImagePath,
} from "../lib/validate";

describe("isValidLink", () => {
  it("accepts https URL", () => {
    expect(isValidLink("https://github.com/BuburEncer")).toBe(true);
  });
  it("accepts http URL", () => {
    expect(isValidLink("http://example.com")).toBe(true);
  });
  it("rejects javascript: URL", () => {
    expect(isValidLink("javascript:alert(document.cookie)")).toBe(false);
  });
  it("rejects data: URL", () => {
    expect(isValidLink("data:text/html,<script>1</script>")).toBe(false);
  });
  it("rejects malformed string", () => {
    expect(isValidLink("not a url")).toBe(false);
  });
});

describe("isValidProjectSource", () => {
  it("accepts github", () => {
    expect(isValidProjectSource("github")).toBe(true);
  });
  it("accepts kaggle", () => {
    expect(isValidProjectSource("kaggle")).toBe(true);
  });
  it("rejects unknown source", () => {
    expect(isValidProjectSource("gitlab")).toBe(false);
  });
  it("rejects empty source", () => {
    expect(isValidProjectSource("")).toBe(false);
  });
});

describe("isValidProjectCategory", () => {
  it("accepts ai", () => {
    expect(isValidProjectCategory("ai")).toBe(true);
  });
  it("accepts software", () => {
    expect(isValidProjectCategory("software")).toBe(true);
  });
  it("rejects unknown category", () => {
    expect(isValidProjectCategory("data")).toBe(false);
  });
  it("rejects empty category", () => {
    expect(isValidProjectCategory("")).toBe(false);
  });
});

describe("isValidProjectImagePath", () => {
  it("accepts a path under /projects/", () => {
    expect(isValidProjectImagePath("/projects/fetal-plane.png")).toBe(true);
  });
  it("rejects remote URL", () => {
    expect(isValidProjectImagePath("https://example.test/demo.png")).toBe(false);
  });
  it("rejects path outside /projects/", () => {
    expect(isValidProjectImagePath("/uploads/demo.png")).toBe(false);
  });
  it("rejects a URL-like path containing parent segments", () => {
    expect(
      isValidProjectImagePath("/projects/screenshots/%2e%2e/%2e%2e/secret.png"),
    ).toBe(false);
  });
  it("rejects empty path", () => {
    expect(isValidProjectImagePath("")).toBe(false);
  });
});
