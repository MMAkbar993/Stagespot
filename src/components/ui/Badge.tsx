const styles = {
  verified: "bg-verified-soft text-verified-ink",
  pending: "bg-pending-soft text-pending-ink",
  rejected: "bg-red-100 text-red-700",
  accent: "bg-accent-soft text-accent-ink",
};

export function Badge({
  variant,
  children,
}: {
  variant: keyof typeof styles;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-semibold ${styles[variant]}`}
    >
      {children}
    </span>
  );
}

export function VerifiedBadge() {
  return (
    <Badge variant="verified">
      <svg viewBox="0 0 24 24" fill="none" className="mr-1 h-3 w-3">
        <path
          d="M5 13l4 4L19 7"
          stroke="#3F5E33"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Verified
    </Badge>
  );
}
