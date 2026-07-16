import type { AnySupabaseClient } from "@/lib/types";

export type DiscoveryPerformer = {
  id: string;
  display_name: string;
  act_type: string | null;
  bio: string | null;
  first_time_flag: boolean | null;
  created_at: string;
  rating: number | null;
};

export type DiscoveryGig = {
  id: string;
  venue_id: string;
  venue_name: string;
  locality: string | null;
  city: string | null;
  event_date: string;
  time_window: string | null;
  act_types_wanted: string[];
  created_at: string;
};

export async function getApprovedPerformers(supabase: AnySupabaseClient, limit = 50): Promise<DiscoveryPerformer[]> {
  const { data } = await supabase
    .from("performer_profiles")
    .select("user_id, display_name, act_type, bio, first_time_flag, created_at")
    .eq("verification_status", "approved")
    .order("created_at", { ascending: false })
    .limit(limit);

  const rows = (data ?? []) as {
    user_id: string;
    display_name: string;
    act_type: string | null;
    bio: string | null;
    first_time_flag: boolean | null;
    created_at: string;
  }[];

  const ratings = await Promise.all(
    rows.map((r) => supabase.rpc("avg_rating", { target_user_id: r.user_id })),
  );

  return rows.map((r, i) => ({
    id: r.user_id,
    display_name: r.display_name,
    act_type: r.act_type,
    bio: r.bio,
    first_time_flag: r.first_time_flag,
    created_at: r.created_at,
    rating: ratings[i]?.data ? Number(ratings[i].data) : null,
  }));
}

type GigWithVenue = {
  id: string;
  venue_id: string;
  event_date: string;
  time_window: string | null;
  act_types_wanted: string[];
  created_at: string;
  venue_profiles: { venue_name: string; locality: string | null; city: string | null } | null;
};

export async function getOpenGigs(supabase: AnySupabaseClient, limit = 50): Promise<DiscoveryGig[]> {
  const { data } = await supabase
    .from("gigs")
    .select(
      "id, venue_id, event_date, time_window, act_types_wanted, created_at, venue_profiles(venue_name, locality, city)",
    )
    .eq("status", "open")
    .order("event_date", { ascending: true })
    .limit(limit)
    .returns<GigWithVenue[]>();

  const rows = data ?? [];

  return rows.map((g) => ({
    id: g.id,
    venue_id: g.venue_id,
    venue_name: g.venue_profiles?.venue_name ?? "Venue",
    locality: g.venue_profiles?.locality ?? null,
    city: g.venue_profiles?.city ?? null,
    event_date: g.event_date,
    time_window: g.time_window,
    act_types_wanted: g.act_types_wanted ?? [],
    created_at: g.created_at,
  }));
}
