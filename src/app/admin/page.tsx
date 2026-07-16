import { AppShell } from "@/components/layout/AppShell";
import { requireAdmin } from "@/lib/auth/guards";
import { VerificationQueueList, type QueueItem } from "@/components/admin/VerificationQueueList";

export default async function AdminDashboardPage() {
  const { supabase } = await requireAdmin();

  const [{ data: pendingPerformers }, { data: pendingVenues }, { count: activeGigs }] = await Promise.all([
    supabase
      .from("performer_profiles")
      .select("user_id, display_name, proof_of_work_links")
      .eq("verification_status", "pending"),
    supabase
      .from("venue_profiles")
      .select("user_id, venue_name, proof_of_business_links")
      .eq("verification_status", "pending"),
    supabase.from("gigs").select("id", { count: "exact", head: true }).eq("status", "open"),
  ]);

  const queue: QueueItem[] = [
    ...(pendingPerformers ?? []).map((p) => ({
      id: p.user_id,
      type: "performer" as const,
      name: p.display_name,
      note: `Performer · ${p.proof_of_work_links?.length ? "proof of work submitted" : "no proof submitted"}`,
    })),
    ...(pendingVenues ?? []).map((v) => ({
      id: v.user_id,
      type: "venue" as const,
      name: v.venue_name,
      note: `Venue · ${v.proof_of_business_links?.length ? "business proof submitted" : "no proof submitted"}`,
    })),
  ];

  return (
    <AppShell title="Admin">
      <div className="mb-4 grid grid-cols-2 gap-2.5 sm:max-w-md">
        <div className="rounded-xl border border-line bg-surface p-3">
          <div className="text-lg font-bold text-ink">{queue.length}</div>
          <div className="text-[10px] text-ink-2">pending</div>
        </div>
        <div className="rounded-xl border border-line bg-surface p-3">
          <div className="text-lg font-bold text-ink">{activeGigs ?? 0}</div>
          <div className="text-[10px] text-ink-2">active gigs</div>
        </div>
      </div>

      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-2">
        Verification queue
      </div>
      <VerificationQueueList items={queue} />
    </AppShell>
  );
}
