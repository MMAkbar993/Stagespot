import type { AnySupabaseClient, BookingStatus, Role } from "@/lib/types";

export type MyBooking = {
  id: string;
  status: BookingStatus;
  scheduled_date: string;
  created_at: string;
  initiated_by: "performer" | "venue";
  counterpart_name: string;
  feedbackSubmitted: boolean;
};

type BookingRow = {
  id: string;
  status: BookingStatus;
  scheduled_date: string;
  created_at: string;
  initiated_by: "performer" | "venue";
  performer_profiles: { display_name: string } | null;
  venue_profiles: { venue_name: string } | null;
};

export async function getMyBookings(
  supabase: AnySupabaseClient,
  userId: string,
  role: Extract<Role, "performer" | "venue">,
): Promise<MyBooking[]> {
  const column = role === "performer" ? "performer_id" : "venue_id";

  const { data } = await supabase
    .from("bookings")
    .select(
      "id, status, scheduled_date, created_at, initiated_by, performer_profiles(display_name), venue_profiles(venue_name)",
    )
    .eq(column, userId)
    .order("created_at", { ascending: false })
    .returns<BookingRow[]>();

  const rows = data ?? [];
  const bookingIds = rows.map((r) => r.id);

  const { data: feedbackRows } =
    bookingIds.length > 0
      ? await supabase
          .from("feedback")
          .select("booking_id")
          .eq("author_role", role)
          .in("booking_id", bookingIds)
      : { data: [] as { booking_id: string }[] };

  const feedbackSet = new Set((feedbackRows ?? []).map((f) => f.booking_id));

  return rows.map((r) => ({
    id: r.id,
    status: r.status,
    scheduled_date: r.scheduled_date,
    created_at: r.created_at,
    initiated_by: r.initiated_by,
    counterpart_name:
      role === "performer"
        ? (r.venue_profiles?.venue_name ?? "Venue")
        : (r.performer_profiles?.display_name ?? "Performer"),
    feedbackSubmitted: feedbackSet.has(r.id),
  }));
}
