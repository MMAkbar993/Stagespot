import { AppShell } from "@/components/layout/AppShell";
import { VerifiedBadge } from "@/components/ui/Badge";
import { StatRow } from "@/components/ui/Stat";
import { ReviewCard } from "@/components/ui/ReviewCard";

// Placeholder profile content — replaced by a real Supabase lookup by `id`
// once the profile/verification phase is implemented.
const mockProfile = {
  name: "Aanya Kapoor",
  idLabel: "Performer · ID P-1042",
  bio: "Acoustic singer-songwriter based in the Delhi region. Started performing this year, mostly covers with a few originals.",
  stats: [
    { value: "4.8", label: "rating" },
    { value: "12", label: "performances" },
    { value: "3", label: "worked with" },
  ],
  recent: [
    { venue: "The Wren Cafe", date: "Jun 14" },
    { venue: "Late Hour Cafe", date: "May 28" },
  ],
  reviews: [
    { text: "Great energy, showed up early.", author: "The Wren Cafe" },
    { text: "Would book again in a heartbeat.", author: "Late Hour Cafe" },
  ],
};

export default async function PerformerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;
  const profile = mockProfile;

  return (
    <AppShell title="Profile" back action={{ label: "Edit", href: "/profile/edit" }}>
      <div className="sm:grid sm:grid-cols-[280px_1fr] sm:gap-10">
        <div className="sm:sticky sm:top-24 sm:self-start">
          <div className="pt-2 text-center sm:pt-0">
            <div className="mx-auto mb-2.5 h-19 w-19 rounded-full border-4 border-surface bg-linear-to-br from-[#D9C3A0] to-accent shadow-[0_0_0_1px_var(--color-line)] sm:h-24 sm:w-24" />
            <div className="text-base font-semibold text-ink sm:text-lg">
              {profile.name}
            </div>
            <div className="mb-2.5 text-xs text-ink-3">{profile.idLabel}</div>
            <div className="mb-3 flex justify-center">
              <VerifiedBadge />
            </div>
          </div>
          <StatRow stats={profile.stats} />
          <p className="my-4 px-1 text-center text-xs leading-relaxed text-ink-2 sm:text-left sm:text-sm">
            {profile.bio}
          </p>
          <div className="mb-2 flex justify-center gap-2.5 sm:justify-start">
            {["instagram", "youtube", "portfolio"].map((label) => (
              <div
                key={label}
                aria-label={label}
                className="flex h-8.5 w-8.5 items-center justify-center rounded-full border border-line text-ink-2"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 sm:mt-0">
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-2">
            Recent performances
          </div>
          {profile.recent.map((r) => (
            <div
              key={r.venue}
              className="flex items-center justify-between border-b border-line py-2.5 text-sm"
            >
              <span className="text-ink">{r.venue}</span>
              <span className="text-xs text-ink-2">{r.date}</span>
            </div>
          ))}

          <div className="mb-1.5 mt-5 text-xs font-semibold uppercase tracking-wide text-ink-2">
            Reviews
          </div>
          {profile.reviews.map((r) => (
            <ReviewCard key={r.author} text={r.text} author={r.author} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
