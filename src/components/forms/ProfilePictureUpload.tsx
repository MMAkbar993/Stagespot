"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ProfilePictureUpload({
  currentUrl,
  onUploaded,
}: {
  currentUrl?: string | null;
  onUploaded: (url: string) => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

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

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-pictures")
      .upload(path, file, { upsert: true, cacheControl: "3600" });

    setLoading(false);
    if (uploadError) {
      setError(uploadError.message);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("profile-pictures").getPublicUrl(path);
    // Cache-bust so a replaced photo shows immediately even though the path is stable.
    const bustedUrl = `${publicUrl}?t=${Date.now()}`;

    setPreviewUrl(bustedUrl);
    onUploaded(bustedUrl);
  }

  return (
    <div className="mx-auto mb-2 flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="h-15 w-15 shrink-0 overflow-hidden rounded-full bg-linear-to-br from-[#D9C3A0] to-accent bg-cover bg-center"
        style={previewUrl ? { backgroundImage: `url(${previewUrl})` } : undefined}
        aria-label="Change profile picture"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="text-xs font-semibold text-accent-ink"
      >
        {loading ? "Uploading…" : "Change photo"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
