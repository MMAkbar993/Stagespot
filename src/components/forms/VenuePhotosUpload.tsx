"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const SLOTS = [0, 1, 2] as const;

export function VenuePhotosUpload({
  currentUrls,
  onChange,
}: {
  currentUrls: (string | null | undefined)[];
  onChange: (urls: (string | null)[]) => void;
}) {
  const [previews, setPreviews] = useState<(string | null)[]>(
    SLOTS.map((i) => currentUrls[i] ?? null),
  );
  // Cache-bust so a replaced photo shows immediately even though the storage
  // path is stable; a plain counter avoids calling an impure Date.now/random
  // during what the React compiler treats as render-adjacent code.
  const [versions, setVersions] = useState<number[]>([0, 0, 0]);
  const [loadingSlot, setLoadingSlot] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  async function handleFileChange(slot: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    setError(null);
    setLoadingSlot(slot);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoadingSlot(null);
      setError("You must be logged in.");
      return;
    }

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/photo-${slot}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("venue-photos")
      .upload(path, file, { upsert: true, cacheControl: "3600" });

    setLoadingSlot(null);
    if (uploadError) {
      setError(uploadError.message);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("venue-photos").getPublicUrl(path);
    const nextVersion = versions[slot] + 1;
    const bustedUrl = `${publicUrl}?t=${nextVersion}`;

    const next = [...previews];
    next[slot] = bustedUrl;
    setPreviews(next);
    setVersions((prev) => {
      const nextVersions = [...prev];
      nextVersions[slot] = nextVersion;
      return nextVersions;
    });
    onChange(next);
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-1.5">
        {SLOTS.map((slot) => (
          <button
            key={slot}
            type="button"
            onClick={() => inputRefs[slot].current?.click()}
            className="h-16 overflow-hidden rounded-lg bg-linear-to-br from-[#EFE7D8] to-[#D9C9A8] bg-cover bg-center text-[10px] font-semibold text-ink-2"
            style={previews[slot] ? { backgroundImage: `url(${previews[slot]})` } : undefined}
          >
            {!previews[slot] && (loadingSlot === slot ? "Uploading…" : "Add photo")}
          </button>
        ))}
      </div>
      {SLOTS.map((slot) => (
        <input
          key={slot}
          ref={inputRefs[slot]}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(slot, e)}
          className="hidden"
        />
      ))}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
