import { describe, expect, it } from "vitest";
import { youtubeId } from "../lib/video";

describe("youtubeId", () => {
  it.each([
    ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://youtu.be/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://www.youtube.com/shorts/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://www.youtube.com/embed/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
  ])("extracts the video id from %s", (url, id) => {
    expect(youtubeId(url)).toBe(id);
  });

  it("returns null for non-YouTube and invalid URLs", () => {
    expect(youtubeId("https://example.com/video.mp4")).toBeNull();
    expect(youtubeId("not-a-url")).toBeNull();
  });
});
