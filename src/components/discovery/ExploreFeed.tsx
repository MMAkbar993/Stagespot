"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { FieldSelect, FieldInput } from "@/components/ui/Field";
import { MasonryGrid, MasonryCard } from "@/components/ui/MasonryGrid";
import { haversineDistanceKm, formatDistanceKm } from "@/lib/distance";
import type { DiscoveryPerformer, DiscoveryGig } from "@/lib/data/discovery";
import type { Role } from "@/lib/types";

const IMAGE_HEIGHTS = [110, 150, 120, 95, 130, 140, 100];
const MAX_DISTANCE_OPTIONS = [2, 5, 10, 25, 50];

type Location = { lat: number; lng: number };

function withDistance<T extends { lat: number | null; lng: number | null }>(
  items: T[],
  from: Location | null,
): (T & { distanceKm: number | null })[] {
  return items.map((item) => ({
    ...item,
    distanceKm:
      from && item.lat != null && item.lng != null
        ? haversineDistanceKm(from.lat, from.lng, item.lat, item.lng)
        : null,
  }));
}

export function ExploreFeed({
  performers,
  gigs,
  viewerRole,
  viewerLocation,
}: {
  performers: DiscoveryPerformer[];
  gigs: DiscoveryGig[];
  viewerRole: Role | null;
  viewerLocation: Location | null;
}) {
  const [filter, setFilter] = useState<"performers" | "gigs">("performers");
  const [category, setCategory] = useState("all");
  const [maxDistance, setMaxDistance] = useState("any");
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");

  // Distance only means something for the "natural" pairing: a performer
  // browsing gigs (distance to the venue), or a venue browsing performers
  // (distance to the performer). The other two combinations have no
  // meaningful reference point, so distance UI stays hidden for those.
  const distanceRelevant =
    (filter === "gigs" && viewerRole === "performer") ||
    (filter === "performers" && viewerRole === "venue");

  const categories = useMemo(() => {
    const set =
      filter === "performers"
        ? new Set(performers.map((p) => p.act_type).filter(Boolean))
        : new Set(gigs.flatMap((g) => g.act_types_wanted));
    return Array.from(set) as string[];
  }, [filter, performers, gigs]);

  const performersWithDistance = useMemo(
    () => withDistance(performers, distanceRelevant ? viewerLocation : null),
    [performers, distanceRelevant, viewerLocation],
  );
  const gigsWithDistance = useMemo(
    () => withDistance(gigs, distanceRelevant ? viewerLocation : null),
    [gigs, distanceRelevant, viewerLocation],
  );

  const filteredPerformers = useMemo(() => {
    let list = performersWithDistance;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => p.display_name.toLowerCase().includes(q));
    }
    if (category !== "all") list = list.filter((p) => p.act_type === category);
    if (distanceRelevant && maxDistance !== "any") {
      const max = Number(maxDistance);
      list = list.filter((p) => p.distanceKm != null && p.distanceKm <= max);
    }
    list = [...list].sort((a, b) => {
      if (sort === "nearest") return (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity);
      if (sort === "top_rated") return (b.rating ?? 0) - (a.rating ?? 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return list;
  }, [performersWithDistance, category, sort, distanceRelevant, maxDistance, search]);

  const filteredGigs = useMemo(() => {
    let list = gigsWithDistance;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((g) => g.venue_name.toLowerCase().includes(q));
    }
    if (category !== "all") list = list.filter((g) => g.act_types_wanted.includes(category));
    if (distanceRelevant && maxDistance !== "any") {
      const max = Number(maxDistance);
      list = list.filter((g) => g.distanceKm != null && g.distanceKm <= max);
    }
    list = [...list].sort((a, b) => {
      if (sort === "nearest") return (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity);
      if (sort === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
    });
    return list;
  }, [gigsWithDistance, category, sort, distanceRelevant, maxDistance, search]);

  function switchFilter(next: "performers" | "gigs") {
    setFilter(next);
    setCategory("all");
    setMaxDistance("any");
    const nextDistanceRelevant =
      (next === "gigs" && viewerRole === "performer") || (next === "performers" && viewerRole === "venue");
    setSort(nextDistanceRelevant && viewerLocation ? "nearest" : next === "performers" ? "newest" : "soonest");
  }

  return (
    <AppShell title="Explore" activeTab="explore" showFab>
      <div className="mb-4 max-w-sm">
        <SegmentedControl
          value={filter}
          onChange={switchFilter}
          options={[
            { value: "performers", label: "Performers" },
            { value: "gigs", label: "Gigs" },
          ]}
        />
      </div>

      <div className="mb-2 flex flex-wrap gap-2">
        <FieldInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={filter === "performers" ? "Search performers by name" : "Search venues by name"}
          className="w-full sm:w-56"
        />
        {categories.length > 0 && (
          <FieldSelect value={category} onChange={(e) => setCategory(e.target.value)} className="w-auto">
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </FieldSelect>
        )}
        {distanceRelevant && viewerLocation && (
          <FieldSelect value={maxDistance} onChange={(e) => setMaxDistance(e.target.value)} className="w-auto">
            <option value="any">Any distance</option>
            {MAX_DISTANCE_OPTIONS.map((km) => (
              <option key={km} value={km}>
                Within {km} km
              </option>
            ))}
          </FieldSelect>
        )}
        <FieldSelect value={sort} onChange={(e) => setSort(e.target.value)} className="w-auto">
          {distanceRelevant && viewerLocation && <option value="nearest">Nearest</option>}
          {filter === "performers" ? (
            <>
              <option value="newest">Newest</option>
              <option value="top_rated">Top rated</option>
            </>
          ) : (
            <>
              <option value="soonest">Soonest</option>
              <option value="newest">Newest posted</option>
            </>
          )}
        </FieldSelect>
      </div>

      {distanceRelevant && !viewerLocation && (
        <p className="mb-3 text-xs text-ink-2">
          Add your location in{" "}
          <a href="/profile/edit" className="font-semibold text-accent-ink">
            your profile
          </a>{" "}
          to filter and sort by distance.
        </p>
      )}

      {filter === "performers" ? (
        filteredPerformers.length === 0 ? (
          <p className="text-sm text-ink-2">No performers match those filters.</p>
        ) : (
          <MasonryGrid>
            {filteredPerformers.map((p, i) => (
              <MasonryCard
                key={p.id}
                href={`/performers/${p.id}`}
                imageHeight={IMAGE_HEIGHTS[i % IMAGE_HEIGHTS.length]}
                name={p.display_name}
                chip={
                  p.distanceKm != null
                    ? formatDistanceKm(p.distanceKm)
                    : p.rating
                      ? `★ ${p.rating.toFixed(1)}${p.act_type ? ` ${p.act_type}` : ""}`
                      : p.first_time_flag
                        ? "first stage"
                        : (p.act_type ?? "performer")
                }
              />
            ))}
          </MasonryGrid>
        )
      ) : filteredGigs.length === 0 ? (
        <p className="text-sm text-ink-2">No gigs match those filters.</p>
      ) : (
        <MasonryGrid>
          {filteredGigs.map((g, i) => (
            <MasonryCard
              key={g.id}
              href={`/gigs/${g.id}`}
              imageHeight={IMAGE_HEIGHTS[i % IMAGE_HEIGHTS.length]}
              name={g.venue_name}
              chip={
                g.distanceKm != null
                  ? formatDistanceKm(g.distanceKm)
                  : new Date(g.event_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })
              }
            />
          ))}
        </MasonryGrid>
      )}
    </AppShell>
  );
}
