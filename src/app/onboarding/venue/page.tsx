import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { AuthShell } from "@/components/layout/AuthShell";
import { VenueProfileForm } from "@/components/forms/VenueProfileForm";

export default async function VenueOnboardingPage() {
  const { supabase, user, role } = await requireUser();
  if (role !== "venue") redirect(role === "performer" ? "/onboarding/performer" : "/home");

  const { data: profile } = await supabase
    .from("venue_profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (profile) redirect("/home");

  return (
    <AuthShell title="Venue profile" backHref="/signup">
      <div className="pb-8 sm:pb-0">
        <VenueProfileForm />
      </div>
    </AuthShell>
  );
}
