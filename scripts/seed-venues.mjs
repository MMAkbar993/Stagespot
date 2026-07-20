// Seeds the real, researched Delhi venues from supabase/seed/venues.json
// (Section 9: initial venue data is entered by hand, not pulled automatically).
// Each venue gets its own auth account (role: venue) so it behaves like any
// other venue in the app; verification_status is set to 'approved' directly
// since these are admin-vetted before being added, skipping the normal queue.
//
// Usage:
//   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SECRET_KEY=... node scripts/seed-venues.mjs
// (or just `npm run seed:venues` if .env already has both set)

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SECRET_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in the environment.");
  process.exit(1);
}

const headers = {
  apikey: SECRET_KEY,
  Authorization: `Bearer ${SECRET_KEY}`,
  "Content-Type": "application/json",
};

async function geocode(address) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "1");
  url.searchParams.set("q", address);

  const res = await fetch(url, {
    headers: { "User-Agent": "StageSpot/1.0 (https://stagespot.app)" },
  });
  if (!res.ok) return null;
  const results = await res.json();
  const top = results[0];
  if (!top) return null;
  return { lat: parseFloat(top.lat), lng: parseFloat(top.lon) };
}

async function venueAlreadySeeded(venueName) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/venue_profiles?select=user_id&venue_name=eq.${encodeURIComponent(venueName)}`,
    { headers },
  );
  const rows = await res.json();
  return Array.isArray(rows) && rows.length > 0;
}

async function createVenueAccount(venueName) {
  const slug = venueName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const email = `${slug}@stagespot-seed.local`;
  const password = crypto.randomUUID();

  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: "venue" },
    }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`Failed to create account for ${venueName}: ${JSON.stringify(body)}`);
  return body.id;
}

async function insertVenueProfile(userId, venue, location) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/venue_profiles`, {
    method: "POST",
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify({
      user_id: userId,
      venue_name: venue.name,
      locality: venue.locality,
      city: venue.city,
      state: venue.state,
      act_types_wanted: venue.act_types_wanted,
      lat: location?.lat ?? null,
      lng: location?.lng ?? null,
      verification_status: "approved",
    }),
  });
  if (!res.ok) throw new Error(`Failed to insert venue_profiles for ${venue.name}: ${await res.text()}`);

  // The exact address lives in its own table so it stays hidden until a
  // booking is confirmed (Section 5.6) — see migration 0007.
  const addressRes = await fetch(`${SUPABASE_URL}/rest/v1/venue_private_details`, {
    method: "POST",
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify({ user_id: userId, address: venue.full_address }),
  });
  if (!addressRes.ok) {
    throw new Error(`Failed to insert venue_private_details for ${venue.name}: ${await addressRes.text()}`);
  }
}

async function main() {
  const dataPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "supabase", "seed", "venues.json");
  const venues = JSON.parse(await readFile(dataPath, "utf-8"));

  for (const venue of venues) {
    if (await venueAlreadySeeded(venue.name)) {
      console.log(`skip (already seeded): ${venue.name}`);
      continue;
    }

    const location = await geocode(venue.full_address).catch(() => null);
    const userId = await createVenueAccount(venue.name);
    await insertVenueProfile(userId, venue, location);
    console.log(`seeded: ${venue.name}${location ? ` (${location.lat}, ${location.lng})` : " (geocoding failed)"}`);

    // Nominatim usage policy: max ~1 request/second.
    await new Promise((resolve) => setTimeout(resolve, 1100));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
