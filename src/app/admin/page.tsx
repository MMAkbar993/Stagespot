import { AppShell } from "@/components/layout/AppShell";
import { getOptionalUser } from "@/lib/auth/guards";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import type { QueueItem } from "@/components/admin/VerificationQueueList";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { getAllGigsForAdmin, getAllBookingsForAdmin, getAllReviewsForAdmin } from "@/lib/data/admin";

export default async function AdminDashboardPage() {
  const { supabase, user, role } = await getOptionalUser();

  if (!user || role !== "admin") {
    return <AdminLoginForm deniedRole={user ? (role ?? undefined) : undefined} />;
  }

  const [
    { data: pendingPerformers },
    { data: pendingVenues },
    { count: activeGigsCount },
    gigs,
    bookings,
    reviews,
  ] = await Promise.all([
    supabase
      .from("performer_profiles")
      .select("user_id, display_name, proof_of_work_links")
      .eq("verification_status", "pending"),
    supabase
      .from("venue_profiles")
      .select("user_id, venue_name, proof_of_business_links")
      .eq("verification_status", "pending"),
    supabase.from("gigs").select("id", { count: "exact", head: true }).eq("status", "open"),
    getAllGigsForAdmin(supabase),
    getAllBookingsForAdmin(supabase),
    getAllReviewsForAdmin(supabase),
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
      <AdminDashboard
        queue={queue}
        gigs={gigs}
        bookings={bookings}
        reviews={reviews}
        activeGigsCount={activeGigsCount ?? 0}
      />
    </AppShell>
  );
}
