export function ReviewCard({
  text,
  author,
}: {
  text: string;
  author: string;
}) {
  return (
    <div className="mb-2 rounded-xl border border-line bg-surface px-3.5 py-2.5">
      <div className="mb-0.5 text-[12.5px] text-ink">&ldquo;{text}&rdquo;</div>
      <div className="text-[10.5px] text-ink-3">{author}</div>
    </div>
  );
}
