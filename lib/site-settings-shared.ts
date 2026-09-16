export type SiteSettings = Record<string, unknown>;

export function settingText(settings: SiteSettings, key: string, fallback: string): string {
  const value = settings[key];
  return typeof value === "string" && value.length > 0 ? value : fallback;
}
