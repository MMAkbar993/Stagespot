import { AppShell } from "@/components/layout/AppShell";
import { FieldLabel, FieldInput } from "@/components/ui/Field";
import { StatusPill } from "@/components/ui/ListCard";
import { BookingActions } from "@/components/bookings/BookingActions";
import { requireUser } from "@/lib/auth/guards";
import { autoCompleteOverdueBookings } from "@/lib/bookings/autoComplete";
import Link from "next/link";

type BookingDetailRow = {
  id: string;
  status: "requested" | "accepted" | "confirmed" | "completed" | "declined" | "cancelled";
  scheduled_date: string;
  initiated_by: "performer" | "venue";
  performer_id: string;
  venue_id: string;
  gigs: { time_window: string | null } | null;
  performer_profiles: { display_name: string } | null;
  venue_profiles: { venue_name: string; locality: string | null; city: string | null } | null;
};

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, user, role } = await requireUser();

  if (role !== "admin") {
    await autoCompleteOverdueBookings(supabase, user.id);
  }

  const { data: booking } = await supabase
    .from("bookings")
    .select(
      "id, status, scheduled_date, initiated_by, performer_id, venue_id, gigs(time_window), performer_profiles(display_name), venue_profiles(venue_name, locality, city)",
    )
    .eq("id", id)
    .maybeSingle<BookingDetailRow>();

  if (!booking) {
    return (
      <AppShell title="Booking" back>
        <p className="py-10 text-center text-sm text-ink-2">This booking isn&apos;t available.</p>
      </AppShell>
    );
  }

  const viewerRole = booking.performer_id === user.id ? "performer" : booking.venue_id === user.id ? "venue" : null;

  if (!viewerRole && role !== "admin") {
    return (
      <AppShell title="Booking" back>
        <p className="py-10 text-center text-sm text-ink-2">This booking isn&apos;t available.</p>
      </AppShell>
    );
  }

  let reveal: { performer_email: string; venue_address: string } | null = null;
  if (booking.status === "confirmed" || booking.status === "completed") {
    const { data } = await supabase
      .rpc("get_booking_reveal", { target_booking_id: booking.id })
      .maybeSingle<{ performer_email: string; venue_address: string }>();
    reveal = data ?? null;
  }

  let feedbackSubmitted = false;
  if (booking.status === "completed" && viewerRole) {
    const { data: existingFeedback } = await supabase
      .from("feedback")
      .select("id")
      .eq("booking_id", booking.id)
      .eq("author_role", viewerRole)
      .maybeSingle();
    feedbackSubmitted = Boolean(existingFeedback);
  }

  const schedule = [
    new Date(booking.scheduled_date).toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    }),
    booking.gigs?.time_window,
  ]
    .filter(Boolean)
    .join(" · ");

  const venueLocation = [booking.venue_profiles?.locality, booking.venue_profiles?.city]
    .filter(Boolean)
    .join(", ");

  return (
    <AppShell title="Booking" back>
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex justify-center">
          <StatusPill status={booking.status} />
        </div>
        <div className="mb-1 text-center text-base font-semibold text-ink">
          {viewerRole === "performer"
            ? (booking.venue_profiles?.venue_name ?? "Venue")
            : (booking.performer_profiles?.display_name ?? "Performer")}
        </div>
        <p className="mb-5 text-center text-sm text-ink-2">{schedule}</p>

        <div className="text-left">
          <FieldLabel>Venue</FieldLabel>
          <FieldInput
            readOnly
            value={
              reveal
                ? `${booking.venue_profiles?.venue_name}, ${reveal.venue_address}`
                : `${booking.venue_profiles?.venue_name ?? "Venue"}${venueLocation ? `, ${venueLocation}` : ""} · exact address after confirming`
            }
          />
          <FieldLabel>Date and time</FieldLabel>
          <FieldInput readOnly value={schedule} />
          <FieldLabel>Contact</FieldLabel>
          <FieldInput
            readOnly
            value={reveal ? reveal.performer_email : "Visible once the booking is confirmed"}
          />
        </div>

        {viewerRole && (
          <BookingActions
            bookingId={booking.id}
            status={booking.status}
            viewerRole={viewerRole}
            initiatedBy={booking.initiated_by}
          />
        )}

        {booking.status === "completed" && viewerRole && (
          feedbackSubmitted ? (
            <p className="mt-4 text-center text-sm text-ink-2">Feedback submitted</p>
          ) : (
            <Link
              href={`/bookings/${booking.id}/feedback`}
              className="mt-4 block text-center text-sm font-semibold text-accent-ink"
            >
              Leave feedback
            </Link>
          )
        )}
      </div>
    </AppShell>
  );
}
