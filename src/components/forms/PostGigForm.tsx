"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FieldLabel, FieldInput, FieldTextarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function PostGigForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // e.currentTarget goes null after the first await, so capture it now.
    const formEl = e.currentTarget;
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      setError("You must be logged in.");
      return;
    }

    const form = new FormData(formEl);
    const actType = form.get("act_type") as string;

    const { data, error } = await supabase
      .from("gigs")
      .insert({
        venue_id: user.id,
        event_date: form.get("event_date"),
        time_window: form.get("time_window") || null,
        act_types_wanted: actType ? [actType] : [],
        description: form.get("notes") || null,
      })
      .select("id")
      .single();

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(`/gigs/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldLabel>Date</FieldLabel>
      <FieldInput type="date" name="event_date" required />
      <FieldLabel>Time window</FieldLabel>
      <FieldInput name="time_window" placeholder="e.g. 7pm to 9pm" required />
      <FieldLabel>Act type needed</FieldLabel>
      <FieldInput name="act_type" placeholder="Music / comedy / poetry / other" />
      <FieldLabel>Notes</FieldLabel>
      <FieldTextarea name="notes" rows={3} placeholder="Mic available, indoor or outdoor" />
      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
      <Button type="submit" block className="mt-5" disabled={loading}>
        {loading ? "Posting…" : "Post gig"}
      </Button>
    </form>
  );
}
