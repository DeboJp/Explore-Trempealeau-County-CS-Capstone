// lib/fetchNearbyPages.ts
// Helper: given one center gisId, find nearby gisIds (nearby.ts)
// and fetch up to maxResults matching pages from the backend.

import { getNearbyGlobalIds } from "../lib/nearby";

const API_BASE = "http://localhost:8000"; // adjust for device vs simulator the last port number 8000.

export type PageData = {
  id: number | string;
  title: string;
  type?: string;
  city?: string;
  pageContent?: string;
  gisId?: string;
  published?: boolean;
  // ...any other fields your API returns
};

export async function fetchNearbyPagesForGisId(
  centerGisId: string,
  radiusMiles = 5,
  maxResults = 5
): Promise<Record<string, PageData>> {
  if (!centerGisId) return {};

  // 1) Get nearby GIS IDs from your local search_index_light.json
  const nearbyIds = getNearbyGlobalIds(centerGisId, radiusMiles);

  const result: Record<string, PageData> = {};

  // 2) For each nearby ID, ask backend if a page exists
  for (const gisId of nearbyIds) {
    if (Object.keys(result).length >= maxResults) break;

    try {
      const url = `${API_BASE}/api/v1/pages/exists?gis_id=${encodeURIComponent(
        gisId
      )}`;
      const res = await fetch(url);
      if (!res.ok) continue;

      const data = await res.json(); // { gisID, exists, page }

      if (data.exists && data.page) {
        result[gisId] = data.page as PageData;
      }
    } catch {
      // ignore individual failures and keep going
    }
  }

  return result;
}
