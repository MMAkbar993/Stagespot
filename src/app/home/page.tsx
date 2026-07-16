"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { FeedCard } from "@/components/ui/FeedCard";
import { mockPerformers, mockGigs } from "@/lib/mock-data";

export default function HomePage() {
  const [filter, setFilter] = useState<"performers" | "gigs">("performers");

  return (
    <AppShell title="Home" activeTab="home" showFab>
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

      <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {filter === "performers"
          ? mockPerformers.map((p) => (
              <FeedCard
                key={p.id}
                href={`/performers/${p.id}`}
                name={p.name}
                meta={p.meta}
                verified={p.verified}
                title="Looking for a Friday slot"
                subtitle="First time performing · open to any cafe"
                primaryAction={{ label: "Invite" }}
              />
            ))
          : mockGigs.map((g) => (
              <FeedCard
                key={g.id}
                href={`/gigs/${g.id}`}
                name={g.venueName}
                meta="Delhi region"
                verified={g.verified}
                title={g.title}
                subtitle={g.subtitle}
                primaryAction={{ label: "Apply" }}
              />
            ))}
      </div>
    </AppShell>
  );
}
