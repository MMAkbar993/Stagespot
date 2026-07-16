"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FieldLabel, FieldInput, FieldTextarea, CheckboxRow } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function PerformerProfileForm({
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
    const socialLink = form.get("social_link") as string;
    const portfolioLink = form.get("portfolio_link") as string;
    const proofLink = form.get("proof_of_work_link") as string;

    const { error } = await supabase.from("performer_profiles").insert({
      user_id: user.id,
      display_name: form.get("display_name"),
      act_type: form.get("act_type") || null,
      bio: form.get("bio") || null,
      social_links: socialLink ? { primary: socialLink } : {},
      portfolio_links: portfolioLink ? [{ url: portfolioLink }] : [],
      first_time_flag: form.get("first_time_flag") === "on",
      proof_of_work_links: proofLink ? [{ url: proofLink }] : [],
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
      <div className="mx-auto mb-2 h-15 w-15 rounded-full bg-linear-to-br from-[#D9C3A0] to-accent" />
      <FieldLabel>Name</FieldLabel>
      <FieldInput name="display_name" placeholder="Your name" required />
      <FieldLabel>Act type</FieldLabel>
      <FieldInput name="act_type" placeholder="Music / comedy / poetry / other" />
      <FieldLabel>Bio</FieldLabel>
      <FieldTextarea name="bio" rows={3} placeholder="Short bio" />
      <FieldLabel>Social media link</FieldLabel>
      <FieldInput name="social_link" placeholder="instagram.com/..." />
      <FieldLabel>Portfolio link</FieldLabel>
      <FieldInput name="portfolio_link" placeholder="youtube.com/..." />
      <CheckboxRow name="first_time_flag">First time performing</CheckboxRow>
      <FieldLabel>Proof of work link</FieldLabel>
      <FieldInput name="proof_of_work_link" placeholder="Link to a video or page" />
      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
      <Button type="submit" block className="mt-5" disabled={loading}>
        {loading ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
