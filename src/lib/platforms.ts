export const PLATFORM_IDS = ["tiktok", "meta", "google"] as const;
export type PlatformId = (typeof PLATFORM_IDS)[number];

export const PLATFORMS: {
  id: PlatformId;
  name: string;
  tagline: string;
}[] = [
  { id: "tiktok", name: "TikTok", tagline: "In-feed video ads" },
  { id: "meta", name: "Meta", tagline: "Facebook & Instagram" },
  { id: "google", name: "Google", tagline: "Responsive Search Ads" },
];

export const DEFAULT_PLATFORMS: PlatformId[] = ["tiktok"];

export function platformName(id: PlatformId): string {
  return PLATFORMS.find((p) => p.id === id)?.name ?? id;
}

/** Maps a free-text platform label from a saved budget plan back to a known platform. */
export function platformIdFromLabel(label: string): PlatformId | null {
  const l = label.toLowerCase();
  if (l.includes("tiktok")) return "tiktok";
  if (l.includes("meta") || l.includes("facebook") || l.includes("instagram")) {
    return "meta";
  }
  if (l.includes("google")) return "google";
  return null;
}

/**
 * Platforms a saved campaign targets, read from its budget plan. Campaigns
 * saved before platform selection existed may not map cleanly - callers get
 * every platform in that case.
 */
export function platformsFromSplit(split: { platform: string }[]): PlatformId[] {
  const ids = new Set<PlatformId>();
  for (const s of split) {
    const id = platformIdFromLabel(s.platform);
    if (id) ids.add(id);
  }
  return ids.size > 0 ? PLATFORM_IDS.filter((id) => ids.has(id)) : [...PLATFORM_IDS];
}
