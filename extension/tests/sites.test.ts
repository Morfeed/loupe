import { describe, expect, it } from "vitest";
import { loadSites } from "../src/core/sites";

describe("site switches", () => {
  it("keeps saved choices and defaults sites that state does not have", () => {
    expect(loadSites({ reddit: false, youtube: true })).toEqual({ reddit: false, youtube: true, x: false });
    expect(loadSites(undefined)).toEqual({ reddit: true, youtube: true, x: false });
    expect(loadSites({ x: "yes" })).toMatchObject({ x: false });
  });
});
