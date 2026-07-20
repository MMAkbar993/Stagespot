import { AppShell } from "@/components/layout/AppShell";
import { VerifiedBadge, Badge } from "@/components/ui/Badge";
import { StatRow } from "@/components/ui/Stat";
import { ReviewCard } from "@/components/ui/ReviewCard";
import { ProfileReviewActions } from "@/components/admin/ProfileReviewActions";
import { getOptionalUser } from "@/lib/auth/guards";
import type { VenueProfile } from "@/lib/types";

type PastGig = { scheduled_date: string; performer_profiles: { display_name: string } | null };
type Review = {
  comment: string | null;
  created_at: string;
  booking: { performer: { display_name: string } | null } | null;
};

export default async function VenueProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, user, role } = await getOptionalUser();

  const { data: venue } = await supabase
    .from("venue_profiles")
    .select("*")
    .eq("user_id", id)
    .maybeSingle<VenueProfile>();

  if (!venue) {
    return (
      <AppShell title="Profile" back>
        <p className="py-10 text-center text-sm text-ink-2">
          This venue profile isn&apos;t available.
        </p>
      </AppShell>
    );
  }

  const isOwner = user?.id === venue.user_id;
  const isAdmin = role === "admin";
  const canSeeProof = isOwner || isAdmin;

  const [{ data: ratingData }, { count: gigsCount }, { data: pastGigs }, { data: reviews }, { data: bookingsForCount }] =
    await Promise.all([
      supabase.rpc("avg_rating", { target_user_id: id }),
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("venue_id", id)
        .eq("status", "completed"),
      supabase
        .from("bookings")
        .select("scheduled_date, performer_profiles(display_name)")
        .eq("venue_id", id)
        .eq("status", "completed")
        .order("scheduled_date", { ascending: false })
        .limit(5)
        .returns<PastGig[]>(),
      supabase
        .from("feedback")
        .select("comment, created_at, booking:bookings!inner(performer:performer_profiles(display_name))")
        .eq("author_role", "performer")
        .eq("booking.venue_id", id)
        .order("created_at", { ascending: false })
        .limit(5)
        .returns<Review[]>(),
      supabase.from("bookings").select("performer_id").eq("venue_id", id).eq("status", "completed"),
    ]);

  const workedWithCount = new Set((bookingsForCount ?? []).map((b) => b.performer_id)).size;

  let alreadyWorkedWith = false;
  if (user && !isOwner) {
    const { data: worked } = await supabase.rpc("has_completed_booking", {
      a: user.id,
      b: id,
    });
    alreadyWorkedWith = Boolean(worked);
  }

  const socialEntries = Object.entries(venue.social_links ?? {});
  const location = [venue.locality, venue.city, venue.state].filter(Boolean).join(", ");

  return (
    <AppShell
      title="Profile"
      back
      action={isOwner ? { label: "Edit", href: "/profile/edit" } : undefined}
    >
      <div className="sm:grid sm:grid-cols-[280px_1fr] sm:gap-10">
        <div className="sm:sticky sm:top-24 sm:self-start">
          <div className="pt-2 text-center sm:pt-0">
            <div
              className="mx-auto mb-2.5 h-19 w-19 rounded-full border-4 border-surface bg-linear-to-br from-[#D9C3A0] to-accent bg-cover bg-center shadow-[0_0_0_1px_var(--color-line)] sm:h-24 sm:w-24"
              style={venue.profile_picture_url ? { backgroundImage: `url(${venue.profile_picture_url})` } : undefined}
            />
            <div className="text-base font-semibold text-ink sm:text-lg">
              {venue.venue_name}
            </div>
            <div className="mb-2.5 text-xs text-ink-3">
              Venue · ID {venue.user_id.slice(0, 8)}
            </div>
            <div className="mb-3 flex flex-wrap justify-center gap-1.5">
              {venue.verification_status === "approved" && <VerifiedBadge />}
              {venue.verification_status === "pending" && canSeeProof && (
                <Badge variant="pending">Pending verification</Badge>
              )}
              {venue.verification_status === "rejected" && canSeeProof && (
                <Badge variant="rejected">Rejected</Badge>
              )}
              {alreadyWorkedWith && <Badge variant="accent">Already worked with</Badge>}
            </div>
            {venue.verification_status === "rejected" && canSeeProof && venue.rejection_reason && (
              <p className="mb-3 text-xs text-red-600">{venue.rejection_reason}</p>
            )}
          </div>
          <StatRow
            stats={[
              { value: ratingData ? Number(ratingData).toFixed(1) : "—", label: "rating" },
              { value: gigsCount ?? 0, label: "gigs hosted" },
              { value: workedWithCount, label: "worked with" },
            ]}
          />
          {location && (
            <p className="my-3 px-1 text-center text-xs text-ink-2 sm:text-left">{location}</p>
          )}
          {venue.photos?.length > 0 && (
            <div className="my-4 grid grid-cols-3 gap-1.5">
              {venue.photos.slice(0, 3).map((photo, i) => (
                <a key={i} href={photo.url} target="_blank" rel="noopener noreferrer">
                  <div className="h-14 rounded-lg bg-linear-to-br from-[#EFE7D8] to-[#D9C9A8]" />
                </a>
              ))}
            </div>
          )}
          {socialEntries.length > 0 && (
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
            </div>
          )}

          {canSeeProof && venue.proof_of_business_links?.length > 0 && (
            <div className="mt-4">
              <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-2">
                Proof of business
              </div>
              <div className="flex flex-wrap gap-2">
                {venue.proof_of_business_links.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-line px-3 py-1.5 text-xs text-ink-2 hover:text-ink"
                  >
                    Link {i + 1}
                  </a>
                ))}
              </div>
            </div>
          )}

          {isAdmin && venue.verification_status === "pending" && (
            <div className="mt-4">
              <ProfileReviewActions profileType="venue" profileId={venue.user_id} />
            </div>
          )}
        </div>

        <div className="mt-5 sm:mt-0">
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-2">
            Past gigs hosted
          </div>
          {pastGigs && pastGigs.length > 0 ? (
            pastGigs.map((g, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-line py-2.5 text-sm"
              >
                <span className="text-ink">
                  {g.performer_profiles?.display_name ?? "Performer"}
                </span>
                <span className="text-xs text-ink-2">
                  {new Date(g.scheduled_date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            ))
          ) : (
            <p className="py-2 text-sm text-ink-2">No gigs hosted yet.</p>
          )}

          <div className="mb-1.5 mt-5 text-xs font-semibold uppercase tracking-wide text-ink-2">
            Reviews
          </div>
          {reviews && reviews.length > 0 ? (
            reviews.map((r, i) => (
              <ReviewCard
                key={i}
                text={r.comment ?? ""}
                author={r.booking?.performer?.display_name ?? "Performer"}
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
