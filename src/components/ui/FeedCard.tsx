import Link from "next/link";
import { Button, ButtonLink } from "./Button";

export type FeedCardProps = {
  href: string;
  name: string;
  meta: string;
  verified?: boolean;
  imageUrl?: string;
  title: string;
  subtitle: string;
  primaryAction: { label: string; onClick?: () => void; href?: string };
};

export function FeedCard({
  href,
  name,
  meta,
  verified,
  imageUrl,
  title,
  subtitle,
  primaryAction,
}: FeedCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <div className="h-7 w-7 shrink-0 rounded-full bg-linear-to-br from-[#D9C3A0] to-accent" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="truncate text-[13px] font-semibold text-ink">
              {name}
            </span>
            {verified && (
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 shrink-0">
                <circle cx="12" cy="12" r="12" fill="#E9EEE4" />
                <path
                  d="M7 12.5l3 3 7-7"
                  stroke="#3F5E33"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <div className="text-[11px] text-ink-2">{meta}</div>
        </div>
      </div>
      <Link href={href} className="block">
        <div
          className="h-36 bg-linear-to-br from-[#EFE7D8] to-[#DDD2BB] sm:h-44"
          style={
            imageUrl
              ? { backgroundImage: `url(${imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
              : undefined
          }
        />
      </Link>
      <div className="p-3">
        <Link href={href}>
          <div className="mb-0.5 text-sm font-semibold text-ink">{title}</div>
        </Link>
        <div className="mb-3 text-xs text-ink-2">{subtitle}</div>
        <div className="flex gap-2">
          {primaryAction.href ? (
            <ButtonLink href={primaryAction.href} variant="primary" className="flex-1 text-center">
              {primaryAction.label}
            </ButtonLink>
          ) : (
            <Button variant="primary" onClick={primaryAction.onClick} className="flex-1">
              {primaryAction.label}
            </Button>
          )}
          <ButtonLink href={href} variant="ghost">
            View
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
