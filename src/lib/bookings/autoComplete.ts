import type { AnySupabaseClient } from "@/lib/types";

/**
 * Section 5.6: "Completed" is supposed to trigger automatically once the
 * scheduled date passes. There's no cron/edge job wired up yet, so this runs
 * as a lazy on-read check scoped to the viewer's own bookings — called at
 * the top of any page that lists or shows bookings, before the real fetch.
 */
export async function autoCompleteOverdueBookings(supabase: AnySupabaseClient, userId: string) {
  const today = new Date().toISOString().slice(0, 10);
  await supabase
    .from("bookings")
    .update({ status: "completed" })
    .eq("status", "confirmed")
    .lt("scheduled_date", today)
    .or(`performer_id.eq.${userId},venue_id.eq.${userId}`);
}
