export function StatRow({
  stats,
}: {
  stats: { value: string | number; label: string }[];
}) {
  return (
    <div className="flex justify-center gap-6 border-y border-line py-3 sm:gap-10">
      {stats.map((stat) => (
        <div key={stat.label} className="text-center">
          <div className="text-lg font-semibold text-ink sm:text-xl">
            {stat.value}
          </div>
          <div className="text-[10px] text-ink-2 sm:text-xs">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

export function StatMini({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex-1 rounded-xl border border-line bg-surface p-3 text-center">
      <div className="text-base font-bold text-accent-ink sm:text-lg">
        {value}
      </div>
      <div className="text-[10px] text-ink-2 sm:text-xs">{label}</div>
    </div>
  );
}
