"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FieldLabel, FieldInput, CheckboxRow } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ProfilePictureUpload } from "@/components/forms/ProfilePictureUpload";
import { VenuePhotosUpload } from "@/components/forms/VenuePhotosUpload";
import type { VenueProfile } from "@/lib/types";

export function VenueProfileForm({
  mode = "create",
  initialValues,
  submitLabel,
  redirectTo = "/home",
}: {
  mode?: "create" | "edit";
  initialValues?: VenueProfile;
  submitLabel?: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pictureUrl, setPictureUrl] = useState(initialValues?.profile_picture_url ?? null);
  const [photoUrls, setPhotoUrls] = useState<(string | null)[]>([
    initialValues?.photos?.[0]?.url ?? null,
    initialValues?.photos?.[1]?.url ?? null,
    initialValues?.photos?.[2]?.url ?? null,
  ]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // e.currentTarget goes null after the first await (React nulls out
    // SyntheticEvent fields once the synchronous dispatch phase ends), so
    // capture the form here before any awaited call.
    const formEl = e.currentTarget;
    setError(null);
    setLoading(true);

    const form = new FormData(formEl);
    const photos = photoUrls.filter((url): url is string => Boolean(url));

    const res = await fetch("/api/venue-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode,
        venue_name: form.get("venue_name"),
        address: form.get("address"),
        act_types_wanted: form.get("act_types_wanted"),
        photos,
        social_link: form.get("social_link"),
        first_time_hosting: form.get("first_time_hosting") === "on",
        proof_of_business_link: form.get("proof_of_business_link"),
        profile_picture_url: pictureUrl,
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
      <FieldLabel>Venue name</FieldLabel>
      <FieldInput
        name="venue_name"
        placeholder="Cafe or restaurant name"
        defaultValue={initialValues?.venue_name}
        required
      />
      <FieldLabel>Full address</FieldLabel>
      <FieldInput
        name="address"
        placeholder="Street, locality, city"
        defaultValue={initialValues?.address}
        required
      />
      <FieldLabel>Act types wanted</FieldLabel>
      <FieldInput
        name="act_types_wanted"
        placeholder="Music / comedy / poetry / other"
        defaultValue={initialValues?.act_types_wanted?.[0]}
      />
      <FieldLabel>Venue photos</FieldLabel>
      <VenuePhotosUpload currentUrls={photoUrls} onChange={setPhotoUrls} />
      <FieldLabel>Social media link</FieldLabel>
      <FieldInput
        name="social_link"
        placeholder="instagram.com/..."
        defaultValue={initialValues?.social_links?.primary}
      />
      <CheckboxRow name="first_time_hosting" defaultChecked={initialValues?.first_time_hosting ?? false}>
        First time hosting
      </CheckboxRow>
      <FieldLabel>Proof of business link</FieldLabel>
      <FieldInput
        name="proof_of_business_link"
        placeholder="Registration or listing link"
        defaultValue={initialValues?.proof_of_business_links?.[0]?.url}
      />
      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
      <Button type="submit" block className="mt-5" disabled={loading}>
        {loading ? "Saving…" : submitLabel ?? (mode === "edit" ? "Save changes" : "Submit for verification")}
      </Button>
    </form>
  );
}
