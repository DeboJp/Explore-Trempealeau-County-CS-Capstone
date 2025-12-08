// lib/nearby.ts
// Given a GlobalID, return all places within radiusMiles of that feature.

import placesData from "../lib/search_index_light.json";

export type Place = {
  label: string;
  lat: number;
  lon: number;
  type: "marker" | "feature";
  source?: string;
  ref_index?: number;
  ref_indices?: number[];
  bbox?: [number, number, number, number];
  global_ids?: string[];
};

const PLACES: Place[] = placesData as Place[];

const EARTH_RADIUS_MILES = 3958.8;

// Great-circle distance between two lat/lon points (Haversine formula)
function haversineMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const rLat1 = toRad(lat1);
  const rLat2 = toRad(lat2);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);

  const a =
    sinDLat * sinDLat +
    Math.cos(rLat1) * Math.cos(rLat2) * sinDLon * sinDLon;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_MILES * c;
}

// Main function: nearby places for a given GlobalID, sorted by distance
export function getNearbyByGlobalId(
  globalId: string,
  radiusMiles = 5
): Place[] {
  const center = PLACES.find(
    (p) => p.global_ids && p.global_ids.includes(globalId)
  );
  if (!center) return [];

  // Build array with distance, then sort, then strip distance
  const withDistances = PLACES
    .filter((p) => {
      // skip the center itself
      if (
        p.label === center.label &&
        p.source === center.source &&
        p.lat === center.lat &&
        p.lon === center.lon
      ) {
        return false;
      }
      const d = haversineMiles(center.lat, center.lon, p.lat, p.lon);
      return d <= radiusMiles;
    })
    .map((p) => ({
      place: p,
      distance: haversineMiles(center.lat, center.lon, p.lat, p.lon),
    }));

  withDistances.sort((a, b) => a.distance - b.distance);

  return withDistances.map((x) => x.place);
}

// Helper: same query, but return just one GlobalID per nearby place
// - Uses the first ID in global_ids[]
// - Skips places with no global_ids or empty arrays
export function getNearbyGlobalIds(
  globalId: string,
  radiusMiles = 5
): string[] {
  const nearbyPlaces = getNearbyByGlobalId(globalId, radiusMiles);

  return nearbyPlaces
    .map((p) => p.global_ids?.[0])
    .filter((id): id is string => Boolean(id));
}

// Example usage: check testNearby.ts
// full place objects, sorted by distance
// const nearbyPlaces = getNearbyByGlobalId(someGlobalId, 5);

// just one GlobalID per nearby place (ignoring ones without IDs)
// const nearbyIds = getNearbyGlobalIds(someGlobalId, 5);

// curls to check should work too (assuming local server):
// curl -X GET \
//   "http://localhost:8000/api/v1/pages/exists?gis_id=%7B05A6B2A8-1EE1-4905-875B-D2116FC63F0D%7D"

// returns
// {"gisID":"{05A6B2A8-1EE1-4905-875B-D2116FC63F0D}","exists":true,"page":{"type":"park","id":13,"city":"osseo","pageContent":"{\"title\": \"Osseo Golf And Rec Center\", \"gisId\": \"{05A6B2A8-1EE1-4905-875B-D2116FC63F0D}\", \"type\": \"park\"}","gisId":"{05A6B2A8-1EE1-4905-875B-D2116FC63F0D}","title":"Osseo Golf And Rec Center"}}%                                                                      