"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FieldLabel, FieldTextarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const tags = ["respectful", "followed through", "would work with again"];

export function FeedbackForm({
  bookingId,
  authorRole,
}: {
  bookingId: string;
  authorRole: "performer" | "venue";
}) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.from("feedback").insert({
      booking_id: bookingId,
      author_role: authorRole,
      star_rating: rating,
      comment: comment || null,
      reputation_tags: selectedTags,
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(`/bookings/${bookingId}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
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
      <FieldTextarea
        rows={3}
        placeholder="Share how it went"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
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
                active ? "bg-accent text-white" : "bg-accent-soft text-accent-ink"
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
      <Button type="submit" block className="mt-5" disabled={loading}>
        {loading ? "Submitting…" : "Submit feedback"}
      </Button>
    </form>
  );
}
