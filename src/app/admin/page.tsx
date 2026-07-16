import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { mockVerificationQueue } from "@/lib/mock-data";

export default function AdminDashboardPage() {
  return (
    <AppShell title="Admin">
      <div className="mb-4 grid grid-cols-2 gap-2.5 sm:max-w-md">
        <div className="rounded-xl border border-line bg-surface p-3">
          <div className="text-lg font-bold text-ink">
            {mockVerificationQueue.length}
          </div>
          <div className="text-[10px] text-ink-2">pending</div>
        </div>
        <div className="rounded-xl border border-line bg-surface p-3">
          <div className="text-lg font-bold text-ink">34</div>
          <div className="text-[10px] text-ink-2">active gigs</div>
        </div>
      </div>

      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-2">
        Verification queue
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {mockVerificationQueue.map((item) => (
          <div key={item.id} className="rounded-2xl border border-line bg-surface p-3.5">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[13px] font-semibold text-ink">
                {item.name}
              </span>
              <span className="rounded-lg bg-pending-soft px-2.5 py-1 text-[10px] font-semibold text-pending-ink">
                Pending
              </span>
            </div>
            <div className="mb-2.5 text-[11px] text-ink-2">
              {item.type} · {item.note}
            </div>
            <div className="flex gap-2">
              <Button variant="primary" className="flex-1">
                Approve
              </Button>
              <Button variant="ghost">Reject</Button>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
