"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FieldLabel, FieldInput, CheckboxRow } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function VenueProfileForm({
  submitLabel = "Submit for verification",
}: {
  submitLabel?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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

    const form = new FormData(e.currentTarget);
    const actTypesWanted = form.get("act_types_wanted") as string;
    const socialLink = form.get("social_link") as string;
    const proofLink = form.get("proof_of_business_link") as string;
    const photos = ["photo_1", "photo_2", "photo_3"]
      .map((name) => form.get(name) as string)
      .filter(Boolean)
      .map((url) => ({ url }));

    // lat/lng are geocoded server-side from `address` in a later build phase.
    const { error } = await supabase.from("venue_profiles").insert({
      user_id: user.id,
      venue_name: form.get("venue_name"),
      address: form.get("address"),
      act_types_wanted: actTypesWanted ? [actTypesWanted] : [],
      photos,
      social_links: socialLink ? { primary: socialLink } : {},
      first_time_hosting: form.get("first_time_hosting") === "on",
      proof_of_business_links: proofLink ? [{ url: proofLink }] : [],
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/home");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldLabel>Venue name</FieldLabel>
      <FieldInput name="venue_name" placeholder="Cafe or restaurant name" required />
      <FieldLabel>Full address</FieldLabel>
      <FieldInput name="address" placeholder="Street, locality, city" required />
      <FieldLabel>Act types wanted</FieldLabel>
      <FieldInput name="act_types_wanted" placeholder="Music / comedy / poetry / other" />
      <FieldLabel>Venue photo links</FieldLabel>
      <div className="space-y-1.5">
        <FieldInput name="photo_1" placeholder="Link to a photo" />
        <FieldInput name="photo_2" placeholder="Link to a photo" />
        <FieldInput name="photo_3" placeholder="Link to a photo" />
      </div>
      <FieldLabel>Social media link</FieldLabel>
      <FieldInput name="social_link" placeholder="instagram.com/..." />
      <CheckboxRow name="first_time_hosting">First time hosting</CheckboxRow>
      <FieldLabel>Proof of business link</FieldLabel>
      <FieldInput name="proof_of_business_link" placeholder="Registration or listing link" />
      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
      <Button type="submit" block className="mt-5" disabled={loading}>
        {loading ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
