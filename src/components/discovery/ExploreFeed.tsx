"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { FieldSelect } from "@/components/ui/Field";
import { MasonryGrid, MasonryCard } from "@/components/ui/MasonryGrid";
import type { DiscoveryPerformer, DiscoveryGig } from "@/lib/data/discovery";

const IMAGE_HEIGHTS = [110, 150, 120, 95, 130, 140, 100];

export function ExploreFeed({
  performers,
  gigs,
}: {
  performers: DiscoveryPerformer[];
  gigs: DiscoveryGig[];
}) {
  const [filter, setFilter] = useState<"performers" | "gigs">("performers");
  const [category, setCategory] = useState("all");
  const [locality, setLocality] = useState("all");
  const [sort, setSort] = useState("newest");

  const categories = useMemo(() => {
    const set =
      filter === "performers"
        ? new Set(performers.map((p) => p.act_type).filter(Boolean))
        : new Set(gigs.flatMap((g) => g.act_types_wanted));
    return Array.from(set) as string[];
  }, [filter, performers, gigs]);

  const localities = useMemo(() => {
    const set = new Set(gigs.map((g) => g.locality || g.city).filter(Boolean));
    return Array.from(set) as string[];
  }, [gigs]);

  const filteredPerformers = useMemo(() => {
    let list = performers;
    if (category !== "all") list = list.filter((p) => p.act_type === category);
    list = [...list].sort((a, b) => {
      if (sort === "top_rated") return (b.rating ?? 0) - (a.rating ?? 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return list;
  }, [performers, category, sort]);

  const filteredGigs = useMemo(() => {
    let list = gigs;
    if (category !== "all") list = list.filter((g) => g.act_types_wanted.includes(category));
    if (locality !== "all") list = list.filter((g) => (g.locality || g.city) === locality);
    list = [...list].sort((a, b) => {
      if (sort === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
    });
    return list;
  }, [gigs, category, locality, sort]);

  function switchFilter(next: "performers" | "gigs") {
    setFilter(next);
    setCategory("all");
    setSort(next === "performers" ? "newest" : "soonest");
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

      <div className="mb-4 flex flex-wrap gap-2">
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
        {filter === "gigs" && localities.length > 0 && (
          <FieldSelect value={locality} onChange={(e) => setLocality(e.target.value)} className="w-auto">
            <option value="all">All localities</option>
            {localities.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </FieldSelect>
        )}
        <FieldSelect value={sort} onChange={(e) => setSort(e.target.value)} className="w-auto">
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
                  p.rating
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
              chip={new Date(g.event_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            />
          ))}
        </MasonryGrid>
      )}
    </AppShell>
  );
}
