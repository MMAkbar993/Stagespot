export type GeocodeResult = {
  lat: number;
  lng: number;
  city: string | null;
  locality: string | null;
  state: string | null;
};

/**
 * Free, keyless geocoding via OpenStreetMap Nominatim (Section 5.4/8).
 * Usage policy requires a descriptive User-Agent and caps us at ~1 req/sec,
 * which is fine here since this only runs on venue profile save.
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "1");
  url.searchParams.set("q", address);

  const res = await fetch(url, {
    headers: { "User-Agent": "StageSpot/1.0 (https://stagespot.app)" },
  });

  if (!res.ok) return null;

  const results = (await res.json()) as Array<{
    lat: string;
    lon: string;
    address?: Record<string, string>;
  }>;

  const top = results[0];
  if (!top) return null;

  const addr = top.address ?? {};
  return {
    lat: parseFloat(top.lat),
    lng: parseFloat(top.lon),
    city: addr.city ?? addr.town ?? addr.village ?? null,
    locality: addr.suburb ?? addr.neighbourhood ?? addr.city_district ?? null,
    state: addr.state ?? null,
  };
}
