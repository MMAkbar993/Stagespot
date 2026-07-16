import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ListCard } from "@/components/ui/ListCard";
import { requireProfile } from "@/lib/auth/guards";
import { autoCompleteOverdueBookings } from "@/lib/bookings/autoComplete";
import { getMyBookings, type MyBooking } from "@/lib/data/bookings";

function metaFor(b: MyBooking, viewerRole: "performer" | "venue") {
  switch (b.status) {
    case "requested":
      return b.initiated_by === viewerRole
        ? `Sent ${new Date(b.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
        : "Awaiting your response";
    case "accepted":
      return "Awaiting confirmation";
    case "confirmed":
      return `Confirmed for ${new Date(b.scheduled_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
    case "completed":
      return b.feedbackSubmitted ? "Feedback submitted" : "Leave feedback";
    case "declined":
      return "Declined";
    case "cancelled":
      return "Cancelled";
  }
}

export default async function MyBookingsPage() {
  const { supabase, user, role } = await requireProfile();

  if (role === "admin") {
    return (
      <AppShell title="My Bookings" back>
        <p className="py-10 text-center text-sm text-ink-2">
          Admin accounts don&apos;t have bookings.
        </p>
      </AppShell>
    );
  }

  await autoCompleteOverdueBookings(supabase, user.id);
  const bookings = await getMyBookings(supabase, user.id, role);

  return (
    <AppShell title="My Bookings" back>
      {bookings.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-2">No bookings yet.</p>
      ) : (
        <div className="mx-auto grid max-w-3xl gap-2.5 sm:grid-cols-2">
          {bookings.map((b) => (
            <Link key={b.id} href={`/bookings/${b.id}`} className="block">
              <ListCard title={b.counterpart_name} status={b.status} meta={metaFor(b, role)} />
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
