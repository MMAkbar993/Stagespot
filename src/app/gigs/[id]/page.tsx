import { AppShell } from "@/components/layout/AppShell";
import { getOptionalUser } from "@/lib/auth/guards";
import { RequestToPerformButton } from "@/components/bookings/RequestToPerformButton";
import { GigOwnerActions } from "@/components/gigs/GigOwnerActions";
import type { BookingStatus } from "@/lib/types";

type GigRow = {
  id: string;
  venue_id: string;
  event_date: string;
  time_window: string | null;
  act_types_wanted: string[];
  description: string | null;
  status: "open" | "closed";
  venue_profiles: {
    venue_name: string;
    locality: string | null;
    city: string | null;
  } | null;
};

export default async function GigDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, user, role } = await getOptionalUser();

  const { data: gig } = await supabase
    .from("gigs")
    .select("id, venue_id, event_date, time_window, act_types_wanted, description, status, venue_profiles(venue_name, locality, city)")
    .eq("id", id)
    .maybeSingle<GigRow>();

  if (!gig) {
    return (
      <AppShell title="Gig" back>
        <p className="py-10 text-center text-sm text-ink-2">This gig isn&apos;t available.</p>
      </AppShell>
    );
  }

  const isOwner = user?.id === gig.venue_id;
  let existingBookingStatus: BookingStatus | null = null;
  let performerApproved = false;

  if (user && role === "performer" && !isOwner) {
    const [{ data: existing }, { data: performerProfile }] = await Promise.all([
      supabase
        .from("bookings")
        .select("status")
        .eq("gig_id", gig.id)
        .eq("performer_id", user.id)
        .in("status", ["requested", "accepted", "confirmed", "completed"])
        .maybeSingle<{ status: BookingStatus }>(),
      supabase
        .from("performer_profiles")
        .select("verification_status")
        .eq("user_id", user.id)
        .maybeSingle<{ verification_status: string }>(),
    ]);
    existingBookingStatus = existing?.status ?? null;
    performerApproved = performerProfile?.verification_status === "approved";
  }

  const location = [gig.venue_profiles?.locality, gig.venue_profiles?.city].filter(Boolean).join(", ");
  const schedule = [
    new Date(gig.event_date).toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    }),
    gig.time_window,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <AppShell title="Gig" back>
      <div className="mx-auto max-w-2xl">
        <div className="mb-3.5 h-40 rounded-2xl bg-linear-to-br from-[#EFE7D8] to-[#DDD2BB] sm:h-64" />
        <h1 className="mb-1 text-base font-semibold text-ink sm:text-xl">
          {gig.venue_profiles?.venue_name ?? "Venue"}
        </h1>
        <div className="mb-2.5 text-xs text-ink-2 sm:text-sm">
          {location || "Delhi region"} · exact address after confirming
        </div>
        <div className="mb-4 text-xs text-ink-2 sm:text-sm">{schedule}</div>
        {gig.act_types_wanted?.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {gig.act_types_wanted.map((type) => (
              <span
                key={type}
                className="rounded-lg bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-accent-ink"
              >
                {type}
              </span>
            ))}
          </div>
        )}
        {gig.description && (
          <>
            <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-2">
              Notes
            </div>
            <p className="mb-5 text-sm leading-relaxed text-ink-2">{gig.description}</p>
          </>
        )}

        {isOwner ? (
          <GigOwnerActions gigId={gig.id} status={gig.status} />
        ) : role === "performer" ? (
          performerApproved || existingBookingStatus ? (
            <RequestToPerformButton
              gigId={gig.id}
              venueId={gig.venue_id}
              scheduledDate={gig.event_date}
              initialStatus={existingBookingStatus}
            />
          ) : (
            <p className="text-sm text-ink-2">
              Your performer profile needs to be verified by an admin before you can request to
              perform.
            </p>
          )
        ) : (
          <p className="text-sm text-ink-2">
            {user ? "Only performers can request to perform." : "Log in as a performer to request this gig."}
          </p>
        )}
      </div>
    </AppShell>
  );
}
