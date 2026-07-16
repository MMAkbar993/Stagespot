"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FieldInput } from "@/components/ui/Field";

export type QueueItem = {
  id: string;
  type: "performer" | "venue";
  name: string;
  note: string;
};

export function VerificationQueueList({ items }: { items: QueueItem[] }) {
  const router = useRouter();
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function submit(item: QueueItem, action: "approved" | "rejected", rejectReason?: string) {
    setError(null);
    setLoadingId(item.id);
    const res = await fetch("/api/admin/verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileType: item.type,
        profileId: item.id,
        action,
        reason: rejectReason,
      }),
    });
    setLoadingId(null);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      return;
    }

    setResolvedIds((prev) => [...prev, item.id]);
    setRejectingId(null);
    setReason("");
    router.refresh();
  }

  const visible = items.filter((item) => !resolvedIds.includes(item.id));

  if (visible.length === 0) {
    return <p className="text-sm text-ink-2">No pending profiles right now.</p>;
  }

  return (
    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
      {visible.map((item) => (
        <div key={item.id} className="rounded-2xl border border-line bg-surface p-3.5">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[13px] font-semibold text-ink">{item.name}</span>
            <span className="rounded-lg bg-pending-soft px-2.5 py-1 text-[10px] font-semibold text-pending-ink">
              Pending
            </span>
          </div>
          <div className="mb-2.5 text-[11px] text-ink-2">{item.note}</div>

          {rejectingId === item.id ? (
            <div>
              <FieldInput
                placeholder="Reason for rejection"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mb-2"
              />
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  className="flex-1"
                  disabled={!reason.trim() || loadingId === item.id}
                  onClick={() => submit(item, "rejected", reason)}
                >
                  Confirm reject
                </Button>
                <Button variant="ghost" onClick={() => setRejectingId(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="primary"
                className="flex-1"
                disabled={loadingId === item.id}
                onClick={() => submit(item, "approved")}
              >
                Approve
              </Button>
              <Button variant="ghost" onClick={() => setRejectingId(item.id)}>
                Reject
              </Button>
            </div>
          )}
        </div>
      ))}
      {error && <p className="text-xs text-red-600 sm:col-span-2 lg:col-span-3">{error}</p>}
    </div>
  );
}
