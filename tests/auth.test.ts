import { describe, it, expect } from "vitest";
import { checkPassword } from "../lib/auth";

describe("checkPassword", () => {
  it("rejects wrong password", () => {
    process.env.ADMIN_PASSWORD = "secret";
    expect(checkPassword("wrong")).toBe(false);
  });
  it("accepts correct password", () => {
    process.env.ADMIN_PASSWORD = "secret";
    expect(checkPassword("secret")).toBe(true);
  });
  it("rejects when env unset", () => {
    delete process.env.ADMIN_PASSWORD;
    expect(checkPassword("secret")).toBe(false);
  });
});
