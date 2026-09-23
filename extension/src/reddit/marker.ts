import type { MatchResult, Rule } from "../core/types";

const MARKER_TAG = "morfeed-marker";
const originalStyles = new WeakMap<HTMLElement, { outline: string; outlineOffset: string }>();

function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

export function clearMarker(post: HTMLElement): void {
  post.querySelector(`:scope > ${MARKER_TAG}`)?.remove();
  const original = originalStyles.get(post);
  if (original) {
    post.style.outline = original.outline;
    post.style.outlineOffset = original.outlineOffset;
    originalStyles.delete(post);
  }
}

export function renderMarker(
  post: HTMLElement,
  results: MatchResult[],
  rules: Rule[],
  onDismiss: (ruleId: string) => void,
): void {
  clearMarker(post);
  const matches = rules.filter((rule) => rule.enabled).flatMap((rule) => {
    const result = results.find((candidate) => candidate.ruleId === rule.id && candidate.matched);
    return result ? [{ rule, result }] : [];
  });
  if (!matches.length) return;

  originalStyles.set(post, { outline: post.style.outline, outlineOffset: post.style.outlineOffset });
  post.style.outline = `2px solid ${matches[0]!.rule.color}`;
  post.style.outlineOffset = "2px";

  const host = document.createElement(MARKER_TAG);
  host.setAttribute("data-morfeed-marker", "");
  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = `
    :host{display:block;margin:8px 12px;font:12px/1.4 ui-sans-serif,system-ui,sans-serif;color:#18181b}
    .row{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
    button{font:inherit}
    .badge{border:0;border-radius:999px;padding:4px 9px;color:white;font-weight:700;cursor:pointer;box-shadow:0 1px 2px #0003}
    .panel{margin-top:7px;padding:9px;border:1px solid #d4d4d8;border-radius:8px;background:#fff;box-shadow:0 3px 12px #0002}
    .reason{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin:0 0 7px}.reason:last-child{margin-bottom:0}.name{font-weight:700}
    .dismiss{border:1px solid #a1a1aa;background:#fafafa;border-radius:6px;padding:3px 8px;cursor:pointer;color:#27272a}
    button:focus-visible{outline:2px solid #2563eb;outline-offset:2px}
    [hidden]{display:none}
    @media(prefers-color-scheme:dark){:host{color:#f4f4f5}.panel{background:#18181b;border-color:#52525b}.dismiss{background:#27272a;border-color:#71717a;color:#fafafa}}
  `;
  const row = createElement("div", "row");
  const panel = createElement("div", "panel");
  panel.hidden = true;
  panel.id = `morfeed-details-${crypto.randomUUID()}`;

  for (const { rule, result } of matches) {
    const badge = createElement("button", "badge", rule.name);
    badge.type = "button";
    badge.style.backgroundColor = rule.color;
    badge.setAttribute("aria-expanded", "false");
    badge.setAttribute("aria-controls", panel.id);
    badge.addEventListener("click", () => {
      panel.hidden = !panel.hidden;
      row.querySelectorAll("button.badge").forEach((button) => button.setAttribute("aria-expanded", String(!panel.hidden)));
    });
    row.append(badge);

    const reason = createElement("div", "reason");
    const copy = createElement("p");
    copy.style.margin = "0";
    const name = createElement("span", "name", `${rule.name}: `);
    copy.append(name, document.createTextNode(result.reason || "Matched this rule."));
    const dismiss = createElement("button", "dismiss", "Dismiss");
    dismiss.type = "button";
    dismiss.setAttribute("aria-label", `Dismiss ${rule.name} for this post`);
    dismiss.addEventListener("click", () => onDismiss(rule.id));
    reason.append(copy, dismiss);
    panel.append(reason);
  }
  shadow.append(style, row, panel);
  post.prepend(host);
}
