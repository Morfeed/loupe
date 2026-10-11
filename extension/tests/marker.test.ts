import { describe, expect, it, vi } from "vitest";
import { strongestAction } from "../src/core/rules";
import { clearMarker, renderMarker, type MarkerOptions } from "../src/feed/marker";
import type { MatchResult, Rule } from "../src/core/types";

const rule: Rule = { id: "rule", name: "Jobs", criterion: "Job listing", enabled: true, color: "#3b82f6", action: "mark" };
const match: MatchResult = { postId: "post", ruleId: "rule", matched: true, reason: "Hiring now." };

function options(overrides: Partial<MarkerOptions> = {}): MarkerOptions {
  return { placement: "start", hideTarget: "item", revealed: false, onDismiss: vi.fn(), onShow: vi.fn(), ...overrides };
}

function feedPost(): HTMLElement {
  const feed = document.createElement("div");
  const post = document.createElement("article");
  post.append(document.createElement("p"));
  feed.append(post);
  document.body.append(feed);
  return post;
}

describe("marker", () => {
  it("isolates UI, outlines the post, and dismisses", () => {
    const post = feedPost();
    const dismiss = vi.fn((ruleId: string) => {
      expect(ruleId).toBe("rule");
      clearMarker(post);
    });
    renderMarker(post, [match], [rule], options({ onDismiss: dismiss }));
    const marker = post.querySelector("loupe-marker");
    expect(marker?.shadowRoot?.textContent).toContain("Jobs");
    expect(post.style.outline).toContain("#3b82f6");
    (marker?.shadowRoot?.querySelector(".dismiss") as HTMLButtonElement).click();
    expect(dismiss).toHaveBeenCalledOnce();
    expect(post.querySelector("loupe-marker")).toBeNull();
  });

  it("keeps marker clicks and keys away from the post", () => {
    const post = feedPost();
    const siteHandler = vi.fn();
    post.addEventListener("click", siteHandler);
    post.addEventListener("keydown", siteHandler);
    renderMarker(post, [match], [rule], options());
    const badge = post.querySelector("loupe-marker")?.shadowRoot?.querySelector<HTMLButtonElement>(".badge");
    badge?.click();
    badge?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, composed: true }));
    expect(siteHandler).not.toHaveBeenCalled();
  });

  it("hides the item behind a placeholder with a Show button", () => {
    const post = feedPost();
    const show = vi.fn();
    renderMarker(post, [match], [{ ...rule, action: "hide" }], options({ onShow: show }));
    const placeholder = post.previousElementSibling;
    expect(placeholder?.tagName).toBe("LOUPE-MARKER");
    expect(post.getAttribute("data-loupe-action")).toBe("hide-item");
    expect(post.style.outline).toBe("");
    (placeholder?.shadowRoot?.querySelector(".show") as HTMLButtonElement).click();
    expect(show).toHaveBeenCalledOnce();

    clearMarker(post);
    expect(post.previousElementSibling).toBeNull();
    expect(post.hasAttribute("data-loupe-action")).toBe(false);
  });

  it("keeps a grid tile and hides only its contents", () => {
    const post = feedPost();
    renderMarker(post, [match], [{ ...rule, action: "hide" }], options({ hideTarget: "contents", placement: "end" }));
    expect(post.getAttribute("data-loupe-action")).toBe("hide-contents");
    expect(post.lastElementChild?.tagName).toBe("LOUPE-MARKER");
    expect(post.previousElementSibling).toBeNull();
  });

  it("marks a revealed post instead of hiding it", () => {
    const post = feedPost();
    renderMarker(post, [match], [{ ...rule, action: "hide" }], options({ revealed: true }));
    expect(post.hasAttribute("data-loupe-action")).toBe(false);
    expect(post.style.outline).toContain("#3b82f6");
  });

  it("removes the post without any Loupe UI", () => {
    const post = feedPost();
    renderMarker(post, [match], [{ ...rule, action: "remove" }], options({ revealed: true }));
    expect(post.getAttribute("data-loupe-action")).toBe("remove");
    expect(post.parentElement?.querySelector("loupe-marker")).toBeNull();
    expect(document.getElementById("loupe-page-style")?.textContent).toContain("display: none");
    clearMarker(post);
    expect(post.hasAttribute("data-loupe-action")).toBe(false);
  });

  it("applies the strongest action of all matching rules", () => {
    expect(strongestAction(["mark", "remove", "hide"])).toBe("remove");
    expect(strongestAction(["mark", "hide"])).toBe("hide");
    expect(strongestAction([])).toBe("mark");
  });
});
