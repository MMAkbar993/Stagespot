"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "./Button";
import { FieldTextarea } from "./Field";
import { createClient } from "@/lib/supabase/client";

type MatchedPerformer = { id: string; display_name: string; act_type: string | null };

export function AiSearchSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [matches, setMatches] = useState<MatchedPerformer[] | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSuggest() {
    setLoading(true);
    setMatches(null);
    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      const data = await res.json();
      setTags(data.tags ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function handleShowMatches() {
    setLoading(true);
    try {
      const supabase = createClient();
      const orFilter = tags
        .map((tag) => `act_type.ilike.%${tag}%,bio.ilike.%${tag}%`)
        .join(",");
      const { data } = await supabase
        .from("performer_profiles")
        .select("user_id, display_name, act_type")
        .eq("verification_status", "approved")
        .or(orFilter)
        .limit(10);
      setMatches(
        (data ?? []).map((p) => ({ id: p.user_id, display_name: p.display_name, act_type: p.act_type })),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-ink/35 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full rounded-t-[22px] bg-surface px-4.5 pb-6 pt-2.5 sm:max-w-md sm:rounded-2xl sm:p-6"
      >
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-line sm:hidden" />
        <div className="mb-1 text-base font-semibold text-ink">
          Describe what you want
        </div>
        <div className="mb-3.5 text-[11.5px] text-ink-2">
          Not sure how to search? Tell us the vibe and we&apos;ll suggest tags.
        </div>
        <FieldTextarea
          rows={3}
          placeholder="Moody, acoustic, late-night energy"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-lg bg-accent-soft px-2.5 py-1 text-[10.5px] font-medium text-accent-ink"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {matches && (
          <div className="mt-3 space-y-1.5">
            {matches.length === 0 ? (
              <p className="text-xs text-ink-2">No matching performers found.</p>
            ) : (
              matches.map((p) => (
                <Link
                  key={p.id}
                  href={`/performers/${p.id}`}
                  onClick={onClose}
                  className="block rounded-lg border border-line px-3 py-2 text-xs text-ink hover:bg-canvas"
                >
                  <span className="font-semibold">{p.display_name}</span>
                  {p.act_type && <span className="text-ink-2"> · {p.act_type}</span>}
                </Link>
              ))
            )}
          </div>
        )}

        <Button
          block
          variant="primary"
          className="mt-4"
          disabled={!description || loading}
          onClick={tags.length > 0 ? handleShowMatches : handleSuggest}
        >
          {loading ? "Thinking…" : tags.length > 0 ? "Show matching performers" : "Suggest tags"}
        </Button>
      </div>
    </div>
  );
}
