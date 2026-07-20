import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { EntryToggle } from "@/components/marketing/EntryToggle";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { StatMini } from "@/components/ui/Stat";
import { MasonryGrid, MasonryCard } from "@/components/ui/MasonryGrid";
import { createClient } from "@/lib/supabase/server";
import { getApprovedPerformers, getOpenGigs } from "@/lib/data/discovery";

const IMAGE_HEIGHTS = [100, 140, 120, 105];

export default async function LandingPage() {
  const supabase = await createClient();

  const [performers, gigs, { count: performerCount }, { count: venueCount }] = await Promise.all([
    getApprovedPerformers(supabase, 2),
    getOpenGigs(supabase, 2),
    supabase.from("performer_profiles").select("user_id", { count: "exact", head: true }).eq("verification_status", "approved"),
    supabase.from("venue_profiles").select("user_id", { count: "exact", head: true }).eq("verification_status", "approved"),
  ]);

  const nearby = [
    ...gigs.map((g) => ({
      key: `gig-${g.id}`,
      href: `/gigs/${g.id}`,
      name: g.venue_name,
      chip: new Date(g.event_date).toLocaleDateString(undefined, { weekday: "short", hour: "numeric" }),
    })),
    ...performers.map((p) => ({
      key: `performer-${p.id}`,
      href: `/performers/${p.id}`,
      name: p.display_name,
      chip: p.act_type ?? "performer",
    })),
  ].slice(0, 4);

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-4 py-4 sm:px-6">
        <Logo />
        <Link href="/login" className="text-sm font-semibold text-accent-ink">
          Log in
        </Link>
      </header>

      <section className="mx-auto grid w-full max-w-5xl flex-1 gap-8 px-4 py-6 sm:grid-cols-2 sm:items-center sm:gap-12 sm:px-6 sm:py-14">
        <div>
          <h1 className="mb-3 text-3xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
            Get your first stage
          </h1>
          <p className="mb-6 max-w-md text-sm leading-relaxed text-ink-2 sm:text-base">
            Find a cafe to perform at, or find a performer for your venue.
            Built for first timers, hyperlocal to the Delhi region.
          </p>
          <div className="max-w-sm">
            <EntryToggle />
          </div>
          <div className="mt-5 flex max-w-sm gap-3">
            <StatMini value={`${performerCount ?? 0}+`} label="verified acts" />
            <StatMini value={`${venueCount ?? 0}+`} label="venues" />
          </div>
        </div>

        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-2">
            This week nearby
          </div>
          {nearby.length === 0 ? (
            <p className="text-sm text-ink-2">New listings appear here as venues and performers join.</p>
          ) : (
            <MasonryGrid>
              {nearby.map((item, i) => (
                <MasonryCard
                  key={item.key}
                  href={item.href}
                  imageHeight={IMAGE_HEIGHTS[i % IMAGE_HEIGHTS.length]}
                  name={item.name}
                  chip={item.chip}
                />
              ))}
            </MasonryGrid>
          )}
        </div>
      </section>

      <HowItWorks />

      <footer className="border-t border-line px-4 py-6 text-center text-xs text-ink-2 sm:px-6">
        <Link href="/terms" className="font-medium text-accent-ink">
          Terms and Conditions
        </Link>
        <p className="mt-2">StageSpot · Delhi region launch</p>
      </footer>
    </div>
  );
}
