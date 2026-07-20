"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { FeedCard } from "@/components/ui/FeedCard";
import { haversineDistanceKm, formatDistanceKm } from "@/lib/distance";
import type { DiscoveryPerformer, DiscoveryGig } from "@/lib/data/discovery";
import type { Role } from "@/lib/types";

type Location = { lat: number; lng: number };

function formatGigDate(g: DiscoveryGig) {
  const date = new Date(g.event_date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  return g.time_window ? `${date} · ${g.time_window}` : date;
}

function distanceTo(item: { lat: number | null; lng: number | null }, from: Location | null) {
  if (!from || item.lat == null || item.lng == null) return null;
  return haversineDistanceKm(from.lat, from.lng, item.lat, item.lng);
}

export function HomeFeed({
  performers,
  gigs,
  viewerRole,
  viewerLocation,
}: {
  performers: DiscoveryPerformer[];
  gigs: DiscoveryGig[];
  viewerRole: Role;
  viewerLocation: Location | null;
}) {
  const [filter, setFilter] = useState<"performers" | "gigs">("performers");

  // Distance is only meaningful for the "natural" pairing (see ExploreFeed).
  const showPerformerDistance = viewerRole === "venue";
  const showGigDistance = viewerRole === "performer";

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
        {filter === "performers" ? (
          performers.length === 0 ? (
            <p className="text-sm text-ink-2">No performers yet.</p>
          ) : (
            performers.map((p) => {
              const distance = showPerformerDistance ? distanceTo(p, viewerLocation) : null;
              return (
                <FeedCard
                  key={p.id}
                  href={`/performers/${p.id}`}
                  name={p.display_name}
                  meta={
                    distance != null
                      ? `${p.act_type ?? "Performer"} · ${formatDistanceKm(distance)}`
                      : (p.act_type ?? "Performer")
                  }
                  verified
                  title={p.bio ? p.bio.slice(0, 60) : "New on StageSpot"}
                  subtitle={p.first_time_flag ? "First time performing" : "Experienced performer"}
                  primaryAction={{
                    label: viewerRole === "venue" ? "Invite" : "View profile",
                    href: `/performers/${p.id}`,
                  }}
                />
              );
            })
          )
        ) : gigs.length === 0 ? (
          <p className="text-sm text-ink-2">No open gigs yet.</p>
        ) : (
          gigs.map((g) => {
            const distance = showGigDistance ? distanceTo(g, viewerLocation) : null;
            const area = [g.locality, g.city].filter(Boolean).join(", ") || "Delhi region";
            return (
              <FeedCard
                key={g.id}
                href={`/gigs/${g.id}`}
                name={g.venue_name}
                meta={distance != null ? `${area} · ${formatDistanceKm(distance)}` : area}
                verified
                title={formatGigDate(g)}
                subtitle={
                  g.act_types_wanted.length > 0
                    ? `Looking for ${g.act_types_wanted.join(", ")}`
                    : "Open to any act"
                }
                primaryAction={{
                  label: viewerRole === "performer" ? "Apply" : "View",
                  href: `/gigs/${g.id}`,
                }}
              />
            );
          })
        )}
      </div>
    </AppShell>
  );
}
