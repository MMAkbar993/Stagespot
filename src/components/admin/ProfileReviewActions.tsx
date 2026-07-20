"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FieldInput } from "@/components/ui/Field";

export function ProfileReviewActions({
  profileType,
  profileId,
  onResolved,
}: {
  profileType: "performer" | "venue";
  profileId: string;
  onResolved?: () => void;
}) {
  const router = useRouter();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(action: "approved" | "rejected", rejectReason?: string) {
    setError(null);
    setLoading(true);
    const res = await fetch("/api/admin/verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileType, profileId, action, reason: rejectReason }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      return;
    }

    setRejecting(false);
    setReason("");
    onResolved?.();
    router.refresh();
  }

  if (rejecting) {
    return (
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
            disabled={!reason.trim() || loading}
            onClick={() => submit("rejected", reason)}
          >
            Confirm reject
          </Button>
          <Button variant="ghost" onClick={() => setRejecting(false)}>
            Cancel
          </Button>
        </div>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <Button variant="primary" className="flex-1" disabled={loading} onClick={() => submit("approved")}>
          Approve
        </Button>
        <Button variant="ghost" onClick={() => setRejecting(true)}>
          Reject
        </Button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
