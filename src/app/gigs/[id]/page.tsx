import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";

// Placeholder content — replaced by a real Supabase lookup by `id` in a later build phase.
const mockGig = {
  venueName: "The Wren Cafe",
  location: "Delhi region · exact address after confirming",
  schedule: "Friday, 7pm to 9pm · acoustic music",
  about: "Small, warm space with a corner stage. Mic and amp available.",
};

export default async function GigDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;
  const gig = mockGig;

  return (
    <AppShell title="Gig" back>
      <div className="mx-auto max-w-2xl">
        <div className="mb-3.5 h-40 rounded-2xl bg-linear-to-br from-[#EFE7D8] to-[#DDD2BB] sm:h-64" />
        <h1 className="mb-1 text-base font-semibold text-ink sm:text-xl">
          {gig.venueName}
        </h1>
        <div className="mb-2.5 text-xs text-ink-2 sm:text-sm">{gig.location}</div>
        <div className="mb-4 text-xs text-ink-2 sm:text-sm">{gig.schedule}</div>
        <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-2">
          About this venue
        </div>
        <p className="mb-5 text-sm leading-relaxed text-ink-2">{gig.about}</p>
        {/* Creates a `requested` booking row once wired to Supabase in a later build phase. */}
        <Button block className="sm:w-auto sm:px-8">
          Request to perform
        </Button>
      </div>
    </AppShell>
  );
}
