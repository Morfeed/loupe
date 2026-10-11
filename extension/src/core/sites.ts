/* Stored site switches with safe defaults */
import { DEFAULT_STATE, SITE_IDS } from "./constants";
import type { SiteId } from "./types";

/* State saved before a site existed has no entry for it, so that site gets its default */
export function loadSites(sites: Partial<Record<SiteId, unknown>> | undefined): Record<SiteId, boolean> {
  return Object.fromEntries(SITE_IDS.map((site) => {
    const enabled = sites?.[site];
    return [site, typeof enabled === "boolean" ? enabled : DEFAULT_STATE.sites[site]];
  })) as Record<SiteId, boolean>;
}
