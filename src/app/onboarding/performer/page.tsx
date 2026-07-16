import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { AuthShell } from "@/components/layout/AuthShell";
import { PerformerProfileForm } from "@/components/forms/PerformerProfileForm";

export default async function PerformerOnboardingPage() {
  const { supabase, user, role } = await requireUser();
  if (role !== "performer") redirect(role === "venue" ? "/onboarding/venue" : "/home");

  const { data: profile } = await supabase
    .from("performer_profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (profile) redirect("/home");

  return (
    <AuthShell title="Your profile" backHref="/signup">
      <div className="pb-8 sm:pb-0">
        <PerformerProfileForm />
      </div>
    </AuthShell>
  );
}
