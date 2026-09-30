import "server-only";
import { cache } from "react";
import { getSiteSettings } from "@/lib/site-settings";
import { CONFIG_KEYS, parseGroup, type ConfigGroup, type SiteConfigGroups } from "@/lib/site-config-schema";
import type { SiteSettings } from "@/lib/site-settings-shared";

export type SiteConfig = SiteConfigGroups & { settings: SiteSettings };

// All structured site configuration for one request, parsed fail-safe over the defaults.
export const getSiteConfig = cache(async (): Promise<SiteConfig> => {
  const settings = await getSiteSettings();
  const groups = Object.fromEntries(
    (Object.keys(CONFIG_KEYS) as ConfigGroup[]).map((g) => [g, parseGroup(g, settings[CONFIG_KEYS[g]])])
  ) as SiteConfigGroups;
  return { ...groups, settings };
});
