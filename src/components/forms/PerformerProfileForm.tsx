"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FieldLabel, FieldInput, FieldTextarea, CheckboxRow } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ProfilePictureUpload } from "@/components/forms/ProfilePictureUpload";
import type { PerformerProfile } from "@/lib/types";

export function PerformerProfileForm({
  mode = "create",
  initialValues,
  submitLabel,
  redirectTo = "/home",
}: {
  mode?: "create" | "edit";
  initialValues?: PerformerProfile;
  submitLabel?: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pictureUrl, setPictureUrl] = useState(initialValues?.profile_picture_url ?? null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // e.currentTarget goes null after the first await, so capture it now.
    const formEl = e.currentTarget;
    setError(null);
    setLoading(true);

    const form = new FormData(formEl);

    const res = await fetch("/api/performer-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode,
        display_name: form.get("display_name"),
        act_type: form.get("act_type"),
        bio: form.get("bio"),
        social_link: form.get("social_link"),
        portfolio_link: form.get("portfolio_link"),
        first_time_flag: form.get("first_time_flag") === "on",
        proof_of_work_link: form.get("proof_of_work_link"),
        profile_picture_url: pictureUrl,
        area: form.get("area"),
      }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      return;
    }
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <ProfilePictureUpload currentUrl={pictureUrl} onUploaded={setPictureUrl} />
      <FieldLabel>Name</FieldLabel>
      <FieldInput name="display_name" placeholder="Your name" defaultValue={initialValues?.display_name} required />
      <FieldLabel>Act type</FieldLabel>
      <FieldInput
        name="act_type"
        placeholder="Music / comedy / poetry / other"
        defaultValue={initialValues?.act_type ?? undefined}
      />
      <FieldLabel>Bio</FieldLabel>
      <FieldTextarea name="bio" rows={3} placeholder="Short bio" defaultValue={initialValues?.bio ?? undefined} />
      <FieldLabel>Your area</FieldLabel>
      <FieldInput
        name="area"
        placeholder="Locality or neighborhood, city"
        defaultValue={initialValues?.locality ?? undefined}
      />
      <FieldLabel>Social media link</FieldLabel>
      <FieldInput
        name="social_link"
        placeholder="instagram.com/..."
        defaultValue={initialValues?.social_links?.primary}
      />
      <FieldLabel>Portfolio link</FieldLabel>
      <FieldInput
        name="portfolio_link"
        placeholder="youtube.com/..."
        defaultValue={initialValues?.portfolio_links?.[0]?.url}
      />
      <CheckboxRow name="first_time_flag" defaultChecked={initialValues?.first_time_flag ?? false}>
        First time performing
      </CheckboxRow>
      <FieldLabel>Proof of work link</FieldLabel>
      <FieldInput
        name="proof_of_work_link"
        placeholder="Link to a video or page"
        defaultValue={initialValues?.proof_of_work_links?.[0]?.url}
      />
      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
      <Button type="submit" block className="mt-5" disabled={loading}>
        {loading ? "Saving…" : submitLabel ?? (mode === "edit" ? "Save changes" : "Submit for verification")}
      </Button>
    </form>
  );
}
