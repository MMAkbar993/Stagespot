"use client";

import { use, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { FieldLabel, FieldTextarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const tags = ["respectful", "followed through", "would work with again"];

export default function FeedbackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  use(params);
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  return (
    <AppShell title="Rate your show" back>
      <div className="mx-auto max-w-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // Writes a row to `feedback` in a later build phase.
          }}
        >
          <div className="my-3 flex justify-center gap-1 text-2xl">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                className={star <= rating ? "text-accent-ink" : "text-line"}
                aria-label={`${star} star${star > 1 ? "s" : ""}`}
              >
                ★
              </button>
            ))}
          </div>
          <FieldLabel>Comment</FieldLabel>
          <FieldTextarea rows={3} placeholder="Share how it went" />
          <FieldLabel>Tags</FieldLabel>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-medium ${
                    active
                      ? "bg-accent text-white"
                      : "bg-accent-soft text-accent-ink"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
          <Button type="submit" block className="mt-5">
            Submit feedback
          </Button>
        </form>
      </div>
    </AppShell>
  );
}
