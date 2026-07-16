import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { FeedbackForm } from "@/components/bookings/FeedbackForm";
import { requireUser } from "@/lib/auth/guards";

export default async function FeedbackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, user } = await requireUser();

  const { data: booking } = await supabase
    .from("bookings")
    .select("id, status, performer_id, venue_id")
    .eq("id", id)
    .maybeSingle();

  if (!booking) redirect("/bookings");

  const viewerRole =
    booking.performer_id === user.id ? "performer" : booking.venue_id === user.id ? "venue" : null;

  if (!viewerRole || booking.status !== "completed") redirect(`/bookings/${id}`);

  const { data: existing } = await supabase
    .from("feedback")
    .select("id")
    .eq("booking_id", id)
    .eq("author_role", viewerRole)
    .maybeSingle();

  if (existing) redirect(`/bookings/${id}`);

  return (
    <AppShell title="Rate your show" back>
      <div className="mx-auto max-w-sm">
        <FeedbackForm bookingId={id} authorRole={viewerRole} />
      </div>
    </AppShell>
  );
}
