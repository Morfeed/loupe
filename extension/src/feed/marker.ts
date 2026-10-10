/* Inline rule markers, hidden-post placeholders, and removed posts */
import { strongestAction } from "../core/rules";
import type { MatchResult, Rule, SiteAdapter } from "../core/types";

const MARKER_TAG = "loupe-marker";
const ACTION_ATTRIBUTE = "data-loupe-action";
const PAGE_STYLE_ID = "loupe-page-style";
/* Site frameworks own and reuse feed elements. Hide them with CSS so that they stay attached and can be restored. */
const PAGE_STYLE = `
  [${ACTION_ATTRIBUTE}="remove"], [${ACTION_ATTRIBUTE}="hide-item"] { display: none !important; }
  [${ACTION_ATTRIBUTE}="hide-contents"] > :not(${MARKER_TAG}) { display: none !important; }
`;
const MARKER_STYLE = `
  :host{display:block;margin:8px 12px;font:12px/1.4 ui-sans-serif,system-ui,sans-serif;color:#18181b}
  .row{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
  button{font:inherit}
  .badge{border:0;border-radius:999px;padding:4px 9px;color:white;font-weight:700;box-shadow:0 1px 2px #0003}
  button.badge{cursor:pointer}
  .panel{margin-top:7px;padding:9px;border:1px solid #d4d4d8;border-radius:8px;background:#fff;box-shadow:0 3px 12px #0002}
  .reason{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin:0 0 7px}.reason:last-child{margin-bottom:0}.name{font-weight:700}
  .dismiss,.show{border:1px solid #a1a1aa;background:#fafafa;border-radius:6px;padding:3px 8px;cursor:pointer;color:#27272a}
  .label{color:#52525b}
  button:focus-visible{outline:2px solid #2563eb;outline-offset:2px}
  [hidden]{display:none}
  @media(prefers-color-scheme:dark){:host{color:#f4f4f5}.panel{background:#18181b;border-color:#52525b}.dismiss,.show{background:#27272a;border-color:#71717a;color:#fafafa}.label{color:#a1a1aa}}
`;
const originalStyles = new WeakMap<HTMLElement, { outline: string; outlineOffset: string }>();
const placeholders = new WeakMap<HTMLElement, HTMLElement>();

export interface MarkerOptions {
  placement: SiteAdapter["markerPlacement"];
  hideTarget: SiteAdapter["hideTarget"];
  /* The user chose Show for this post, so a hide action marks it instead */
  revealed: boolean;
  onDismiss: (ruleId: string) => void;
  onShow: () => void;
}

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

function ensurePageStyle(): void {
  if (document.getElementById(PAGE_STYLE_ID)) return;
  const style = createElement("style", undefined, PAGE_STYLE);
  style.id = PAGE_STYLE_ID;
  (document.head ?? document.documentElement).append(style);
}

function createHost(): { host: HTMLElement; shadow: ShadowRoot } {
  const host = document.createElement(MARKER_TAG);
  host.setAttribute("data-loupe-marker", "");
  const shadow = host.attachShadow({ mode: "open" });
  shadow.append(createElement("style", undefined, MARKER_STYLE));
  return { host, shadow };
}

function insert(post: HTMLElement, host: HTMLElement, placement: MarkerOptions["placement"]): void {
  if (placement === "start") post.prepend(host);
  else post.append(host);
}

export function clearMarker(post: HTMLElement): void {
  post.querySelector(`:scope > ${MARKER_TAG}`)?.remove();
  placeholders.get(post)?.remove();
  placeholders.delete(post);
  post.removeAttribute(ACTION_ATTRIBUTE);
  const original = originalStyles.get(post);
  if (original) {
    post.style.outline = original.outline;
    post.style.outlineOffset = original.outlineOffset;
    originalStyles.delete(post);
  }
}

function renderPlaceholder(post: HTMLElement, rules: Rule[], options: MarkerOptions): void {
  const { host, shadow } = createHost();
  const row = createElement("div", "row");
  row.append(createElement("span", "label", "Hidden by Loupe"));
  for (const rule of rules) {
    const tag = createElement("span", "badge", rule.name);
    tag.style.backgroundColor = rule.color;
    row.append(tag);
  }
  const show = createElement("button", "show", "Show");
  show.type = "button";
  show.setAttribute("aria-label", `Show post hidden by ${rules.map((rule) => rule.name).join(", ")}`);
  show.addEventListener("click", options.onShow);
  row.append(show);
  shadow.append(row);

  ensurePageStyle();
  if (options.hideTarget === "item") {
    post.before(host);
    placeholders.set(post, host);
    post.setAttribute(ACTION_ATTRIBUTE, "hide-item");
  } else {
    insert(post, host, options.placement);
    post.setAttribute(ACTION_ATTRIBUTE, "hide-contents");
  }
}

export function renderMarker(post: HTMLElement, results: MatchResult[], rules: Rule[], options: MarkerOptions): void {
  clearMarker(post);
  const matches = rules.filter((rule) => rule.enabled).flatMap((rule) => {
    const result = results.find((candidate) => candidate.ruleId === rule.id && candidate.matched);
    return result ? [{ rule, result }] : [];
  });
  if (!matches.length) return;

  const action = strongestAction(matches.map(({ rule }) => rule.action));
  if (action === "remove") {
    ensurePageStyle();
    post.setAttribute(ACTION_ATTRIBUTE, "remove");
    return;
  }
  if (action === "hide" && !options.revealed) {
    renderPlaceholder(post, matches.filter(({ rule }) => rule.action === "hide").map(({ rule }) => rule), options);
    return;
  }

  originalStyles.set(post, { outline: post.style.outline, outlineOffset: post.style.outlineOffset });
  post.style.outline = `2px solid ${matches[0]!.rule.color}`;
  post.style.outlineOffset = "2px";

  const { host, shadow } = createHost();
  const row = createElement("div", "row");
  const panel = createElement("div", "panel");
  panel.hidden = true;
  panel.id = `loupe-details-${crypto.randomUUID()}`;

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
    dismiss.addEventListener("click", () => options.onDismiss(rule.id));
    reason.append(copy, dismiss);
    panel.append(reason);
  }
  shadow.append(row, panel);
  insert(post, host, options.placement);
}
