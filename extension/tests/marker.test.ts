import { describe, expect, it, vi } from "vitest";
import { clearMarker, renderMarker } from "../src/reddit/marker";
import type { Rule } from "../src/core/types";

const rule: Rule = { id: "rule", name: "Jobs", criterion: "Job listing", enabled: true, color: "#3b82f6" };

describe("marker", () => {
  it("isolates UI, outlines the post, and dismisses", () => {
    const post = document.createElement("article");
    const dismiss = vi.fn((ruleId: string) => {
      expect(ruleId).toBe("rule");
      clearMarker(post);
    });
    renderMarker(post, [{ postId: "post", ruleId: "rule", matched: true, reason: "Hiring now." }], [rule], dismiss);
    const marker = post.querySelector("morfeed-marker");
    expect(marker?.shadowRoot?.textContent).toContain("Jobs");
    expect(post.style.outline).toContain("#3b82f6");
    (marker?.shadowRoot?.querySelector(".dismiss") as HTMLButtonElement).click();
    expect(dismiss).toHaveBeenCalledOnce();
    expect(post.querySelector("morfeed-marker")).toBeNull();
  });
});
