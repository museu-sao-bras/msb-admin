import { apiGet } from "@/lib/api";

let cached: string[] | null = null;
let expiresAt = 0;
const TTL_MS = 1000 * 60 * 60; // 1 hour

export async function getCategories(force = false): Promise<string[]> {
  const now = Date.now();
  if (!force && cached && expiresAt > now) {
    return cached;
  }

  try {
    const res: any = await apiGet(`/inventory/categories/list`);
    let list: any = res;
    if (res && typeof res === 'object') {
      if (Array.isArray(res)) list = res;
      else if (Array.isArray(res.items)) list = res.items;
      else if (Array.isArray(res.categories)) list = res.categories;
    }
    if (Array.isArray(list)) {
      const normalized = list.map((c: any) => (typeof c === 'string' ? c : (c?.name || c?.label || ''))).filter(Boolean);
      cached = normalized;
      expiresAt = Date.now() + TTL_MS;
      return normalized;
    }
  } catch (err) {
    console.warn('Failed to fetch categories', err);
  }

  // fallback to empty list
  cached = [];
  expiresAt = Date.now() + TTL_MS;
  return cached;
}

export function clearCategoriesCache() {
  cached = null;
  expiresAt = 0;
}
