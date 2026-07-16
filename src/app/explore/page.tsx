"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { MasonryGrid, MasonryCard } from "@/components/ui/MasonryGrid";
import { mockPerformers, mockGigs, mockVenues } from "@/lib/mock-data";

export default function ExplorePage() {
  const [filter, setFilter] = useState<"performers" | "gigs">("performers");

  const performerCards = mockPerformers.map((p, i) => ({
    key: p.id,
    href: `/performers/${p.id}`,
    imageHeight: [110, 150, 120, 95, 130][i % 5],
    name: p.name,
    chip: p.chip,
  }));

  const gigCards = mockGigs.map((g, i) => ({
    key: g.id,
    href: `/gigs/${g.id}`,
    imageHeight: [100, 130, 110][i % 3],
    name: g.venueName,
    chip: mockVenues.find((v) => v.id === g.venueId)?.chip ?? "Open",
  }));

  const cards = filter === "performers" ? performerCards : gigCards;

  return (
    <AppShell title="Explore" activeTab="explore" showFab>
      <div className="mb-4 max-w-sm">
        <SegmentedControl
          value={filter}
          onChange={setFilter}
          options={[
            { value: "performers", label: "Performers" },
            { value: "gigs", label: "Gigs" },
          ]}
        />
      </div>

      <MasonryGrid>
        {cards.map((card) => (
          <MasonryCard
            key={card.key}
            href={card.href}
            imageHeight={card.imageHeight}
            name={card.name}
            chip={card.chip}
          />
        ))}
      </MasonryGrid>
    </AppShell>
  );
}
