"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export function GigOwnerActions({ gigId, status }: { gigId: string; status: "open" | "closed" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("gigs")
      .update({ status: status === "open" ? "closed" : "open" })
      .eq("id", gigId);
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <p className="mb-2 text-sm text-ink-2">This is your gig.</p>
      <Button variant="ghost" onClick={toggle} disabled={loading}>
        {loading ? "Updating…" : status === "open" ? "Close gig" : "Reopen gig"}
      </Button>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
