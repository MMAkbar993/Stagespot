import type { AnySupabaseClient } from "@/lib/types";
import type { BookingStatus } from "@/lib/types";

export type AdminGig = {
  id: string;
  venue_name: string;
  event_date: string;
  time_window: string | null;
  status: "open" | "closed";
  act_types_wanted: string[];
};

export type AdminBooking = {
  id: string;
  status: BookingStatus;
  scheduled_date: string;
  performer_name: string;
  venue_name: string;
};

export type AdminReview = {
  id: string;
  author_role: "performer" | "venue";
  star_rating: number;
  comment: string | null;
  reputation_tags: string[];
  created_at: string;
  performer_name: string;
  venue_name: string;
};

type GigRow = {
  id: string;
  event_date: string;
  time_window: string | null;
  status: "open" | "closed";
  act_types_wanted: string[];
  venue_profiles: { venue_name: string } | null;
};

export async function getAllGigsForAdmin(supabase: AnySupabaseClient): Promise<AdminGig[]> {
  const { data } = await supabase
    .from("gigs")
    .select("id, event_date, time_window, status, act_types_wanted, venue_profiles(venue_name)")
    .order("created_at", { ascending: false })
    .returns<GigRow[]>();

  return (data ?? []).map((g) => ({
    id: g.id,
    venue_name: g.venue_profiles?.venue_name ?? "Venue",
    event_date: g.event_date,
    time_window: g.time_window,
    status: g.status,
    act_types_wanted: g.act_types_wanted ?? [],
  }));
}

type BookingRow = {
  id: string;
  status: BookingStatus;
  scheduled_date: string;
  performer_profiles: { display_name: string } | null;
  venue_profiles: { venue_name: string } | null;
};

export async function getAllBookingsForAdmin(supabase: AnySupabaseClient): Promise<AdminBooking[]> {
  const { data } = await supabase
    .from("bookings")
    .select("id, status, scheduled_date, performer_profiles(display_name), venue_profiles(venue_name)")
    .order("created_at", { ascending: false })
    .returns<BookingRow[]>();

  return (data ?? []).map((b) => ({
    id: b.id,
    status: b.status,
    scheduled_date: b.scheduled_date,
    performer_name: b.performer_profiles?.display_name ?? "Performer",
    venue_name: b.venue_profiles?.venue_name ?? "Venue",
  }));
}

type ReviewRow = {
  id: string;
  author_role: "performer" | "venue";
  star_rating: number;
  comment: string | null;
  reputation_tags: string[];
  created_at: string;
  booking: {
    performer_profiles: { display_name: string } | null;
    venue_profiles: { venue_name: string } | null;
  } | null;
};

export async function getAllReviewsForAdmin(supabase: AnySupabaseClient): Promise<AdminReview[]> {
  const { data } = await supabase
    .from("feedback")
    .select(
      "id, author_role, star_rating, comment, reputation_tags, created_at, booking:bookings(performer_profiles(display_name), venue_profiles(venue_name))",
    )
    .order("created_at", { ascending: false })
    .returns<ReviewRow[]>();

  return (data ?? []).map((r) => ({
    id: r.id,
    author_role: r.author_role,
    star_rating: r.star_rating,
    comment: r.comment,
    reputation_tags: r.reputation_tags ?? [],
    created_at: r.created_at,
    performer_name: r.booking?.performer_profiles?.display_name ?? "Performer",
    venue_name: r.booking?.venue_profiles?.venue_name ?? "Venue",
  }));
}
