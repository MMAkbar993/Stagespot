import { AppShell } from "@/components/layout/AppShell";
import { VerifiedBadge } from "@/components/ui/Badge";
import { StatRow } from "@/components/ui/Stat";
import { ReviewCard } from "@/components/ui/ReviewCard";

// Placeholder profile content — replaced by a real Supabase lookup by `id`
// once the profile/verification phase is implemented.
const mockVenue = {
  name: "The Wren Cafe",
  idLabel: "Venue · ID V-2087",
  stats: [
    { value: "4.6", label: "rating" },
    { value: "21", label: "gigs hosted" },
    { value: "5", label: "worked with" },
  ],
  pastGigs: [
    { performer: "Aanya Kapoor", date: "Jun 14" },
    { performer: "Kabir Sen", date: "May 30" },
  ],
  reviews: [{ text: "Welcoming space, good crowd.", author: "Kabir Sen" }],
};

export default async function VenueProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;
  const venue = mockVenue;

  return (
    <AppShell title="Profile" back action={{ label: "Edit", href: "/profile/edit" }}>
      <div className="sm:grid sm:grid-cols-[280px_1fr] sm:gap-10">
        <div className="sm:sticky sm:top-24 sm:self-start">
          <div className="pt-2 text-center sm:pt-0">
            <div className="mx-auto mb-2.5 h-19 w-19 rounded-full border-4 border-surface bg-linear-to-br from-[#D9C3A0] to-accent shadow-[0_0_0_1px_var(--color-line)] sm:h-24 sm:w-24" />
            <div className="text-base font-semibold text-ink sm:text-lg">
              {venue.name}
            </div>
            <div className="mb-2.5 text-xs text-ink-3">{venue.idLabel}</div>
            <div className="mb-3 flex justify-center">
              <VerifiedBadge />
            </div>
          </div>
          <StatRow stats={venue.stats} />
          <div className="my-4 grid grid-cols-3 gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-14 rounded-lg bg-linear-to-br from-[#EFE7D8] to-[#D9C9A8]"
              />
            ))}
          </div>
        </div>

        <div className="mt-5 sm:mt-0">
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-2">
            Past gigs hosted
          </div>
          {venue.pastGigs.map((g) => (
            <div
              key={g.performer}
              className="flex items-center justify-between border-b border-line py-2.5 text-sm"
            >
              <span className="text-ink">{g.performer}</span>
              <span className="text-xs text-ink-2">{g.date}</span>
            </div>
          ))}

          <div className="mb-1.5 mt-5 text-xs font-semibold uppercase tracking-wide text-ink-2">
            Reviews
          </div>
          {venue.reviews.map((r) => (
            <ReviewCard key={r.author} text={r.text} author={r.author} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
