"use client";

import { useState } from "react";
import { Button } from "./Button";
import { FieldTextarea } from "./Field";

export function AiSearchSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSuggest() {
    setLoading(true);
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
        <Button
          block
          variant="primary"
          className="mt-4"
          disabled={!description || loading}
          onClick={handleSuggest}
        >
          {loading ? "Thinking…" : "Show matching performers"}
        </Button>
      </div>
    </div>
  );
}
