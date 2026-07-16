import Link from "next/link";

export function MasonryGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 [&>*]:mb-3">
      {children}
    </div>
  );
}

export function MasonryCard({
  href,
  imageHeight = 130,
  imageUrl,
  name,
  chip,
}: {
  href: string;
  imageHeight?: number;
  imageUrl?: string;
  name: string;
  chip: string;
}) {
  return (
    <Link
      href={href}
      className="block break-inside-avoid overflow-hidden rounded-2xl border border-line bg-surface"
    >
      <div
        className="bg-linear-to-br from-[#EFE7D8] to-[#D9C9A8]"
        style={{
          height: imageHeight,
          ...(imageUrl && {
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }),
        }}
      />
      <div className="p-2.5">
        <div className="truncate text-xs font-semibold text-ink">{name}</div>
        <span className="mt-1 inline-flex items-center rounded-lg bg-accent-soft px-2 py-0.5 text-[10px] font-medium text-accent-ink">
          {chip}
        </span>
      </div>
    </Link>
  );
}
