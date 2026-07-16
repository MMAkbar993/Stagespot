import { AppShell } from "@/components/layout/AppShell";
import { VerifiedBadge, Badge } from "@/components/ui/Badge";
import { StatRow } from "@/components/ui/Stat";
import { ReviewCard } from "@/components/ui/ReviewCard";
import { InvitePerformerButton, type InviteGigOption } from "@/components/bookings/InvitePerformerButton";
import { getOptionalUser } from "@/lib/auth/guards";
import type { PerformerProfile } from "@/lib/types";

type RecentPerformance = { scheduled_date: string; venue_profiles: { venue_name: string } | null };
type Review = {
  comment: string | null;
  created_at: string;
  booking: { venue: { venue_name: string } | null } | null;
};

export default async function PerformerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, user, role } = await getOptionalUser();

  const { data: profile } = await supabase
    .from("performer_profiles")
    .select("*")
    .eq("user_id", id)
    .maybeSingle<PerformerProfile>();

  if (!profile) {
    return (
      <AppShell title="Profile" back>
        <p className="py-10 text-center text-sm text-ink-2">
          This performer profile isn&apos;t available.
        </p>
      </AppShell>
    );
  }

  const isOwner = user?.id === profile.user_id;

  const [{ data: ratingData }, { count: performancesCount }, { data: recent }, { data: reviews }, { data: bookingsForCount }] =
    await Promise.all([
      supabase.rpc("avg_rating", { target_user_id: id }),
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("performer_id", id)
        .eq("status", "completed"),
      supabase
        .from("bookings")
        .select("scheduled_date, venue_profiles(venue_name)")
        .eq("performer_id", id)
        .eq("status", "completed")
        .order("scheduled_date", { ascending: false })
        .limit(5)
        .returns<RecentPerformance[]>(),
      supabase
        .from("feedback")
        .select("comment, created_at, booking:bookings!inner(venue:venue_profiles(venue_name))")
        .eq("author_role", "venue")
        .eq("booking.performer_id", id)
        .order("created_at", { ascending: false })
        .limit(5)
        .returns<Review[]>(),
      supabase.from("bookings").select("venue_id").eq("performer_id", id).eq("status", "completed"),
    ]);

  const workedWithCount = new Set((bookingsForCount ?? []).map((b) => b.venue_id)).size;

  let alreadyWorkedWith = false;
  if (user && !isOwner) {
    const { data: worked } = await supabase.rpc("has_completed_booking", {
      a: user.id,
      b: id,
    });
    alreadyWorkedWith = Boolean(worked);
  }

  let inviteGigs: InviteGigOption[] = [];
  if (user && role === "venue" && !isOwner && profile.verification_status === "approved") {
    const { data: openGigs } = await supabase
      .from("gigs")
      .select("id, event_date, time_window")
      .eq("venue_id", user.id)
      .eq("status", "open")
      .order("event_date", { ascending: true });

    inviteGigs = (openGigs ?? []).map((g) => ({
      id: g.id,
      event_date: g.event_date,
      label: [
        new Date(g.event_date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        g.time_window,
      ]
        .filter(Boolean)
        .join(", "),
    }));
  }

  const socialEntries = Object.entries(profile.social_links ?? {});

  return (
    <AppShell
      title="Profile"
      back
      action={isOwner ? { label: "Edit", href: "/profile/edit" } : undefined}
    >
      <div className="sm:grid sm:grid-cols-[280px_1fr] sm:gap-10">
        <div className="sm:sticky sm:top-24 sm:self-start">
          <div className="pt-2 text-center sm:pt-0">
            <div className="mx-auto mb-2.5 h-19 w-19 rounded-full border-4 border-surface bg-linear-to-br from-[#D9C3A0] to-accent shadow-[0_0_0_1px_var(--color-line)] sm:h-24 sm:w-24" />
            <div className="text-base font-semibold text-ink sm:text-lg">
              {profile.display_name}
            </div>
            <div className="mb-2.5 text-xs text-ink-3">
              Performer · ID {profile.user_id.slice(0, 8)}
            </div>
            <div className="mb-3 flex flex-wrap justify-center gap-1.5">
              {profile.verification_status === "approved" && <VerifiedBadge />}
              {profile.verification_status === "pending" && isOwner && (
                <Badge variant="pending">Pending verification</Badge>
              )}
              {alreadyWorkedWith && <Badge variant="accent">Already worked with</Badge>}
            </div>
          </div>
          <StatRow
            stats={[
              { value: ratingData ? Number(ratingData).toFixed(1) : "—", label: "rating" },
              { value: performancesCount ?? 0, label: "performances" },
              { value: workedWithCount, label: "worked with" },
            ]}
          />
          {profile.bio && (
            <p className="my-4 px-1 text-center text-xs leading-relaxed text-ink-2 sm:text-left sm:text-sm">
              {profile.bio}
            </p>
          )}
          {profile.act_type && (
            <p className="mb-3 text-center text-xs text-ink-2 sm:text-left">
              {profile.act_type}
            </p>
          )}
          {(socialEntries.length > 0 || profile.portfolio_links?.length > 0) && (
            <div className="mb-2 flex flex-wrap justify-center gap-2 sm:justify-start">
              {socialEntries.map(([key, url]) => (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-line px-3 py-1.5 text-xs text-ink-2 hover:text-ink"
                >
                  {key}
                </a>
              ))}
              {profile.portfolio_links?.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-line px-3 py-1.5 text-xs text-ink-2 hover:text-ink"
                >
                  Portfolio
                </a>
              ))}
            </div>
          )}
          {role === "venue" && !isOwner && profile.verification_status === "approved" && (
            <div className="mt-4">
              <InvitePerformerButton performerId={id} venueId={user!.id} gigs={inviteGigs} />
            </div>
          )}
        </div>

        <div className="mt-5 sm:mt-0">
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-2">
            Recent performances
          </div>
          {recent && recent.length > 0 ? (
            recent.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-line py-2.5 text-sm"
              >
                <span className="text-ink">{r.venue_profiles?.venue_name ?? "Venue"}</span>
                <span className="text-xs text-ink-2">
                  {new Date(r.scheduled_date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            ))
          ) : (
            <p className="py-2 text-sm text-ink-2">No performances yet.</p>
          )}

          <div className="mb-1.5 mt-5 text-xs font-semibold uppercase tracking-wide text-ink-2">
            Reviews
          </div>
          {reviews && reviews.length > 0 ? (
            reviews.map((r, i) => (
              <ReviewCard
                key={i}
                text={r.comment ?? ""}
                author={r.booking?.venue?.venue_name ?? "Venue"}
              />
            ))
          ) : (
            <p className="py-2 text-sm text-ink-2">No reviews yet.</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
