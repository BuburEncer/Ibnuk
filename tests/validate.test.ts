import { describe, it, expect } from "vitest";
import {
  isValidLink,
  isValidProjectSource,
  isValidProjectCategory,
  isImageDataUrl,
  hasAllowedImageMagic,
  MAX_IMAGE_BYTES,
  hasAllowedVideoMagic,
  MAX_VIDEO_BYTES,
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

describe("isImageDataUrl", () => {
  it("accepts a png data url", () => {
    expect(isImageDataUrl("data:image/png;base64,iVBORw0KGgo=")).toBe(true);
  });
  it("accepts jpeg webp gif", () => {
    expect(isImageDataUrl("data:image/jpeg;base64,/9j/")).toBe(true);
    expect(isImageDataUrl("data:image/webp;base64,UklGRg==")).toBe(true);
    expect(isImageDataUrl("data:image/gif;base64,R0lGODlh")).toBe(true);
  });
  it("rejects remote URL", () => {
    expect(isImageDataUrl("https://example.test/demo.png")).toBe(false);
  });
  it("rejects svg data url", () => {
    expect(isImageDataUrl("data:image/svg+xml;base64,PHN2Zz4=")).toBe(false);
  });
  it("rejects empty string", () => {
    expect(isImageDataUrl("")).toBe(false);
  });
});

it("caps project images at 2MB", () => {
  expect(MAX_IMAGE_BYTES).toBe(2 * 1024 * 1024);
});

describe("hasAllowedImageMagic", () => {
  it("accepts real png jpeg gif webp headers", () => {
    expect(hasAllowedImageMagic(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d]), "image/png")).toBe(true);
    expect(hasAllowedImageMagic(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]), "image/jpeg")).toBe(true);
    expect(hasAllowedImageMagic(new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39]), "image/gif")).toBe(true);
    const webp = new Uint8Array(12);
    webp.set([0x52, 0x49, 0x46, 0x46], 0);
    webp.set([0x57, 0x45, 0x42, 0x50], 8);
    expect(hasAllowedImageMagic(webp, "image/webp")).toBe(true);
  });
  it("rejects content that does not match the declared type", () => {
    const svg = new TextEncoder().encode("<svg/>");
    expect(hasAllowedImageMagic(svg, "image/png")).toBe(false);
    expect(hasAllowedImageMagic(svg, "image/jpeg")).toBe(false);
  });
  it("rejects unknown types", () => {
    expect(hasAllowedImageMagic(new Uint8Array([0x89, 0x50]), "image/svg+xml")).toBe(false);
  });
});

describe("hasAllowedVideoMagic", () => {
  it("accepts mp4 ftyp and webm EBML headers", () => {
    const mp4 = new Uint8Array(16);
    mp4.set([0x66, 0x74, 0x79, 0x70], 4);
    expect(hasAllowedVideoMagic(mp4, "video/mp4")).toBe(true);
    expect(
      hasAllowedVideoMagic(new Uint8Array([0x1a, 0x45, 0xdf, 0xa3, 0x01]), "video/webm"),
    ).toBe(true);
  });
  it("rejects content that does not match the declared type", () => {
    const junk = new TextEncoder().encode("not a video file at all");
    expect(hasAllowedVideoMagic(junk, "video/mp4")).toBe(false);
    expect(hasAllowedVideoMagic(junk, "video/webm")).toBe(false);
    expect(hasAllowedVideoMagic(new Uint8Array(16), "video/avi")).toBe(false);
  });
  it("caps video size at 20MB", () => {
    expect(MAX_VIDEO_BYTES).toBe(20 * 1024 * 1024);
  });
});
