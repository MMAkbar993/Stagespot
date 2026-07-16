import Link from "next/link";

function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 68 100"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="34" cy="50" r="22" fill="#A8763F" />
      <path
        d="M34 36 L38.4 47.4 L50 50 L38.4 52.6 L34 64 L29.6 52.6 L18 50 L29.6 47.4 Z"
        fill="#FAF8F5"
      />
    </svg>
  );
}

/**
 * "sm" is the compact icon + wordmark used in nav bars.
 * "lg" renders the full StageSpot lockup (icon + wordmark + tagline) for marketing contexts.
 */
export function Logo({ size = "sm" }: { size?: "sm" | "lg" }) {
  if (size === "lg") {
    return (
      <Link href="/" className="inline-flex items-center gap-3">
        <Mark size={44} />
        <span className="flex flex-col leading-none">
          <span className="text-2xl font-bold tracking-tight text-ink">
            StageSpot
          </span>
          <span className="mt-1 text-[10px] font-medium uppercase tracking-wide text-ink-2">
            Get Your First Stage
          </span>
        </span>
      </Link>
    );
  }

  return (
    <Link href="/" className="inline-flex items-center gap-2 shrink-0">
      <Mark size={22} />
      <span className="text-lg font-bold tracking-tight text-ink">
        StageSpot
      </span>
    </Link>
  );
}
