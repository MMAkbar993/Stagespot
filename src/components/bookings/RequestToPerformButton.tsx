"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/ListCard";
import type { BookingStatus } from "@/lib/types";

export function RequestToPerformButton({
  gigId,
  venueId,
  scheduledDate,
  initialStatus,
}: {
  gigId: string;
  venueId: string;
  scheduledDate: string;
  initialStatus: BookingStatus | null;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRequest() {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      setError("You must be logged in.");
      return;
    }

    const { error } = await supabase.from("bookings").insert({
      gig_id: gigId,
      performer_id: user.id,
      venue_id: venueId,
      status: "requested",
      initiated_by: "performer",
      scheduled_date: scheduledDate,
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setStatus("requested");
  }

  if (status) {
    return <StatusPill status={status} />;
  }

  return (
    <div>
      <Button block className="sm:w-auto sm:px-8" onClick={handleRequest} disabled={loading}>
        {loading ? "Sending…" : "Request to perform"}
      </Button>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
