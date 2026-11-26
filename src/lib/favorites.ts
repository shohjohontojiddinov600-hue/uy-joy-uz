const FAVORITES_KEY = "uyjoy_favorite_listings";
export const FAVORITES_CHANGED_EVENT = "uyjoy-favorites-changed";

export function getFavoriteIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

export function isFavoriteId(id: string): boolean {
  return getFavoriteIds().includes(id);
}

export function toggleFavoriteId(id: string): boolean {
  if (typeof window === "undefined") return false;
  const current = getFavoriteIds();
  const exists = current.includes(id);
  const next = exists
    ? current.filter((item) => item !== id)
    : [id, ...current];

  try {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(FAVORITES_CHANGED_EVENT));
  } catch {
    // localStorage cheklangan holat
  }

  return !exists;
}

