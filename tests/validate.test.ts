import { describe, it, expect } from "vitest";
import { isValidLink } from "../lib/validate";

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
