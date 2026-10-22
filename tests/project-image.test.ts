import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

describe("broken project image", () => {
  it("hides the image element marked hidden by onError", () => {
    expect(css).toMatch(/\.project-image\[hidden\]\s*\{\s*display:\s*none/);
  });
});
