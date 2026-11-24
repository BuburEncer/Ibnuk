import { describe, it, expect } from "vitest";
import { skillIcon } from "../lib/skill-icons";

describe("skillIcon", () => {
  it("finds icons by title regardless of case and punctuation", () => {
    expect(skillIcon("Node.js")?.slug).toBe("nodedotjs");
    expect(skillIcon("scikit-learn")?.slug).toBe("scikitlearn");
    expect(skillIcon("pytorch")?.slug).toBe("pytorch");
  });
  it("maps React Native to the React icon", () => {
    expect(skillIcon("React Native")?.slug).toBe("react");
  });
  it("returns undefined for skills without an icon", () => {
    expect(skillIcon("streamlit-webrtc")).toBeUndefined();
  });
});
