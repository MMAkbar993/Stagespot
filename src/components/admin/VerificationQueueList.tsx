"use client";

import { useState } from "react";
import Link from "next/link";
import { ProfileReviewActions } from "@/components/admin/ProfileReviewActions";

export type QueueItem = {
  id: string;
  type: "performer" | "venue";
  name: string;
  note: string;
};

export function VerificationQueueList({ items }: { items: QueueItem[] }) {
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);
  const visible = items.filter((item) => !resolvedIds.includes(item.id));

  if (visible.length === 0) {
    return <p className="text-sm text-ink-2">No pending profiles right now.</p>;
  }

  return (
    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
      {visible.map((item) => (
        <div key={item.id} className="rounded-2xl border border-line bg-surface p-3.5">
          <div className="mb-1 flex items-center justify-between">
            <Link
              href={item.type === "venue" ? `/venues/${item.id}` : `/performers/${item.id}`}
              className="text-[13px] font-semibold text-ink hover:text-accent-ink hover:underline"
            >
              {item.name}
            </Link>
            <span className="rounded-lg bg-pending-soft px-2.5 py-1 text-[10px] font-semibold text-pending-ink">
              Pending
            </span>
          </div>
          <div className="mb-2.5 text-[11px] text-ink-2">{item.note}</div>
          <ProfileReviewActions
            profileType={item.type}
            profileId={item.id}
            onResolved={() => setResolvedIds((prev) => [...prev, item.id])}
          />
        </div>
      ))}
    </div>
  );
}
