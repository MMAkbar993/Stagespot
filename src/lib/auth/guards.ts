import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { PerformerProfile, VenueProfile, Role } from "@/lib/types";

/** Never redirects — for public pages that behave differently when signed in. */
export async function getOptionalUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, user: null, role: null as Role | null };

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return { supabase, user, role: (profileRow?.role ?? null) as Role | null };
}

export async function requireUser() {
  const { supabase, user, role } = await getOptionalUser();
  if (!user) redirect("/login");
  return { supabase, user, role: role as Role };
}

/** Redirects to the role's onboarding form if the profile row doesn't exist yet. */
export async function requireProfile() {
  const { supabase, user, role } = await requireUser();

  if (role === "admin") {
    return { supabase, user, role, profile: null };
  }

  const table = role === "venue" ? "venue_profiles" : "performer_profiles";
  const { data: profile } = await supabase
    .from(table)
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle<PerformerProfile | VenueProfile>();

  if (!profile) redirect(`/onboarding/${role}`);

  return { supabase, user, role, profile };
}

export async function requireAdmin() {
  const { supabase, user, role } = await requireUser();
  if (role !== "admin") redirect("/home");
  return { supabase, user };
}
