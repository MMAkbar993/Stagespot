"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import type { BookingStatus } from "@/lib/types";

export function BookingActions({
  bookingId,
  status,
  viewerRole,
  initiatedBy,
}: {
  bookingId: string;
  status: BookingStatus;
  viewerRole: "performer" | "venue";
  initiatedBy: "performer" | "venue";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(action: "accept" | "decline" | "confirm" | "cancel") {
    setLoading(action);
    setError(null);
    const res = await fetch("/api/bookings/transition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, action }),
    });
    setLoading(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      return;
    }
    router.refresh();
  }

  const isInitiator = initiatedBy === viewerRole;

  let buttons: React.ReactNode = null;

  if (status === "requested") {
    buttons = isInitiator ? (
      <Button variant="ghost" onClick={() => act("decline")} disabled={!!loading}>
        {loading === "decline" ? "Withdrawing…" : "Withdraw request"}
      </Button>
    ) : (
      <div className="flex gap-2">
        <Button onClick={() => act("accept")} disabled={!!loading} className="flex-1">
          {loading === "accept" ? "Accepting…" : "Accept"}
        </Button>
        <Button variant="ghost" onClick={() => act("decline")} disabled={!!loading}>
          {loading === "decline" ? "Declining…" : "Decline"}
        </Button>
      </div>
    );
  } else if (status === "accepted") {
    buttons = (
      <div className="flex gap-2">
        <Button onClick={() => act("confirm")} disabled={!!loading} className="flex-1">
          {loading === "confirm" ? "Confirming…" : "Confirm"}
        </Button>
        <Button variant="ghost" onClick={() => act("cancel")} disabled={!!loading}>
          {loading === "cancel" ? "Cancelling…" : "Cancel"}
        </Button>
      </div>
    );
  } else if (status === "confirmed") {
    buttons = (
      <Button variant="ghost" block onClick={() => act("cancel")} disabled={!!loading}>
        {loading === "cancel" ? "Cancelling…" : "Cancel booking"}
      </Button>
    );
  }

  if (!buttons) return null;

  return (
    <div className="mt-4">
      {buttons}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
