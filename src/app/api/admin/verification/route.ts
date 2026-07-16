import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Body = {
  profileType: "performer" | "venue";
  profileId: string;
  action: "approved" | "rejected";
  reason?: string;
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileRow?.role !== "admin") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const body = (await request.json()) as Body;
  const { profileType, profileId, action, reason } = body;

  if (!profileId || !["performer", "venue"].includes(profileType) || !["approved", "rejected"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (action === "rejected" && !reason?.trim()) {
    return NextResponse.json({ error: "A reason is required to reject a profile" }, { status: 400 });
  }

  const table = profileType === "venue" ? "venue_profiles" : "performer_profiles";
  const admin = createAdminClient();

  const { error: updateError } = await admin
    .from(table)
    .update({
      verification_status: action,
      rejection_reason: action === "rejected" ? reason : null,
    })
    .eq("user_id", profileId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await admin.from("verification_actions").insert({
    profile_type: profileType,
    profile_id: profileId,
    admin_id: user.id,
    action,
    reason: action === "rejected" ? reason : null,
  });

  return NextResponse.json({ success: true });
}
