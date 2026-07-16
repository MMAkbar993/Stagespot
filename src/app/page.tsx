import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { EntryToggle } from "@/components/marketing/EntryToggle";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { StatMini } from "@/components/ui/Stat";
import { MasonryGrid, MasonryCard } from "@/components/ui/MasonryGrid";
import { mockPerformers, mockVenues } from "@/lib/mock-data";

export default function LandingPage() {
  const nearby = [
    { name: mockVenues[0].name, chip: mockVenues[0].chip, height: 100 },
    { name: mockPerformers[2].name, chip: "poetry", height: 140 },
    { name: mockVenues[1].name, chip: mockVenues[1].chip, height: 120 },
    { name: mockPerformers[0].name, chip: "acoustic", height: 100 },
  ];

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
            <StatMini value="120+" label="verified acts" />
            <StatMini value="40+" label="venues" />
          </div>
        </div>

        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-2">
            This week nearby
          </div>
          <MasonryGrid>
            {nearby.map((item) => (
              <MasonryCard
                key={item.name}
                href="/login"
                imageHeight={item.height}
                name={item.name}
                chip={item.chip}
              />
            ))}
          </MasonryGrid>
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
