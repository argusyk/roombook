import { describe, it, expect } from "vitest";
import { devToken, userIdFromHeaders } from "../src/auth/token";

describe("dev-токени", () => {
  it("devToken має вигляд dev-<id>", () => {
    expect(devToken(5)).toBe("dev-5");
  });

  it("читає id з Bearer-токена", () => {
    expect(userIdFromHeaders({ authorization: "Bearer dev-5" })).toBe(5);
  });

  it("читає id з x-test-user", () => {
    expect(userIdFromHeaders({ "x-test-user": "12" })).toBe(12);
  });

  it("ігнорує сторонні токени", () => {
    expect(userIdFromHeaders({ authorization: "Bearer abc" })).toBeNull();
    expect(userIdFromHeaders({ authorization: "Basic dev-5" })).toBeNull();
  });

  it("ігнорує нечислові та нульові id", () => {
    expect(userIdFromHeaders({ "x-test-user": "load-1" })).toBeNull();
    expect(userIdFromHeaders({ authorization: "Bearer dev-0" })).toBeNull();
  });
});
