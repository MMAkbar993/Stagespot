const statusStyles = {
  requested: "bg-pending-soft text-pending-ink",
  accepted: "bg-accent-soft text-accent-ink",
  confirmed: "bg-accent-soft text-accent-ink",
  completed: "bg-verified-soft text-verified-ink",
  declined: "bg-red-100 text-red-700",
  cancelled: "bg-red-100 text-red-700",
};

const statusLabels: Record<keyof typeof statusStyles, string> = {
  requested: "Requested",
  accepted: "Accepted",
  confirmed: "Confirmed",
  completed: "Completed",
  declined: "Declined",
  cancelled: "Cancelled",
};

export function StatusPill({ status }: { status: keyof typeof statusStyles }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-lg px-2.5 py-1 text-[10px] font-semibold ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

export function ListCard({
  title,
  status,
  meta,
  children,
}: {
  title: string;
  status?: keyof typeof statusStyles;
  meta: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-3.5 sm:p-4">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-[13px] font-semibold text-ink">{title}</span>
        {status && <StatusPill status={status} />}
      </div>
      <div className="text-[11px] text-ink-2">{meta}</div>
      {children}
    </div>
  );
}
