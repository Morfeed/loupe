import { describe, expect, it } from "vitest";
import { chunk, contentFingerprint } from "../src/core/batch";

describe("batch helpers", () => {
  it("chunks without losing items", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("creates stable content fingerprints", () => {
    expect(contentFingerprint("same")).toBe(contentFingerprint("same"));
    expect(contentFingerprint("same")).not.toBe(contentFingerprint("different"));
  });
});
