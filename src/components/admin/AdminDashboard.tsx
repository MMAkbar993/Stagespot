"use client";

import { useState } from "react";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { StatusPill } from "@/components/ui/ListCard";
import { VerificationQueueList, type QueueItem } from "@/components/admin/VerificationQueueList";
import type { AdminGig, AdminBooking, AdminReview } from "@/lib/data/admin";

type Tab = "verification" | "gigs" | "bookings" | "reviews";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function AdminDashboard({
  queue,
  gigs,
  bookings,
  reviews,
  activeGigsCount,
}: {
  queue: QueueItem[];
  gigs: AdminGig[];
  bookings: AdminBooking[];
  reviews: AdminReview[];
  activeGigsCount: number;
}) {
  const [tab, setTab] = useState<Tab>("verification");

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-2.5 sm:max-w-md">
        <div className="rounded-xl border border-line bg-surface p-3">
          <div className="text-lg font-bold text-ink">{queue.length}</div>
          <div className="text-[10px] text-ink-2">pending</div>
        </div>
        <div className="rounded-xl border border-line bg-surface p-3">
          <div className="text-lg font-bold text-ink">{activeGigsCount}</div>
          <div className="text-[10px] text-ink-2">active gigs</div>
        </div>
      </div>

      <div className="mb-4 max-w-xl">
        <SegmentedControl
          value={tab}
          onChange={setTab}
          options={[
            { value: "verification", label: "Verification" },
            { value: "gigs", label: "Gigs" },
            { value: "bookings", label: "Bookings" },
            { value: "reviews", label: "Reviews" },
          ]}
        />
      </div>

      {tab === "verification" && (
        <>
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-2">
            Verification queue
          </div>
          <VerificationQueueList items={queue} />
        </>
      )}

      {tab === "gigs" && (
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {gigs.length === 0 ? (
            <p className="text-sm text-ink-2">No gigs yet.</p>
          ) : (
            gigs.map((g) => (
              <div key={g.id} className="rounded-2xl border border-line bg-surface p-3.5">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-ink">{g.venue_name}</span>
                  <span
                    className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold ${
                      g.status === "open" ? "bg-verified-soft text-verified-ink" : "bg-canvas text-ink-2"
                    }`}
                  >
                    {g.status === "open" ? "Open" : "Closed"}
                  </span>
                </div>
                <div className="text-[11px] text-ink-2">
                  {formatDate(g.event_date)}
                  {g.time_window ? ` · ${g.time_window}` : ""}
                </div>
                {g.act_types_wanted.length > 0 && (
                  <div className="mt-1 text-[11px] text-ink-2">{g.act_types_wanted.join(", ")}</div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {tab === "bookings" && (
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {bookings.length === 0 ? (
            <p className="text-sm text-ink-2">No bookings yet.</p>
          ) : (
            bookings.map((b) => (
              <div key={b.id} className="rounded-2xl border border-line bg-surface p-3.5">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-ink">
                    {b.performer_name} × {b.venue_name}
                  </span>
                  <StatusPill status={b.status} />
                </div>
                <div className="text-[11px] text-ink-2">{formatDate(b.scheduled_date)}</div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "reviews" && (
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.length === 0 ? (
            <p className="text-sm text-ink-2">No reviews yet.</p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="rounded-2xl border border-line bg-surface p-3.5">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-ink">
                    {r.author_role === "venue" ? r.venue_name : r.performer_name} rated{" "}
                    {r.author_role === "venue" ? r.performer_name : r.venue_name}
                  </span>
                  <span className="text-xs font-semibold text-accent-ink">★ {r.star_rating}</span>
                </div>
                {r.comment && <p className="mb-1.5 text-xs text-ink-2">&ldquo;{r.comment}&rdquo;</p>}
                {r.reputation_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {r.reputation_tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-lg bg-accent-soft px-2 py-0.5 text-[10px] font-medium text-accent-ink"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
