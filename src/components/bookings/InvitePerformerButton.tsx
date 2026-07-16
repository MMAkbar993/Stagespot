"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { FieldSelect } from "@/components/ui/Field";

export type InviteGigOption = {
  id: string;
  label: string;
  event_date: string;
};

export function InvitePerformerButton({
  performerId,
  venueId,
  gigs,
}: {
  performerId: string;
  venueId: string;
  gigs: InviteGigOption[];
}) {
  const [selectedGigId, setSelectedGigId] = useState(gigs[0]?.id ?? "");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (gigs.length === 0) {
    return (
      <p className="text-xs text-ink-2">
        Post a gig first to invite performers to it.
      </p>
    );
  }

  if (sent) {
    return <p className="text-xs text-verified-ink">Invite sent.</p>;
  }

  async function handleInvite() {
    setLoading(true);
    setError(null);

    const gig = gigs.find((g) => g.id === selectedGigId);
    if (!gig) {
      setLoading(false);
      return;
    }

    const supabase = createClient();

    const { data: existing } = await supabase
      .from("bookings")
      .select("id")
      .eq("gig_id", gig.id)
      .eq("performer_id", performerId)
      .in("status", ["requested", "accepted", "confirmed", "completed"])
      .maybeSingle();

    if (existing) {
      setLoading(false);
      setError("You've already got a booking with this performer for that gig.");
      return;
    }

    const { error } = await supabase.from("bookings").insert({
      gig_id: gig.id,
      performer_id: performerId,
      venue_id: venueId,
      status: "requested",
      initiated_by: "venue",
      scheduled_date: gig.event_date,
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <FieldSelect
        value={selectedGigId}
        onChange={(e) => setSelectedGigId(e.target.value)}
        className="sm:max-w-56"
      >
        {gigs.map((g) => (
          <option key={g.id} value={g.id}>
            {g.label}
          </option>
        ))}
      </FieldSelect>
      <Button onClick={handleInvite} disabled={loading}>
        {loading ? "Sending…" : "Invite"}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
