import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { geocodeAddress } from "@/lib/geocode";

type Body = {
  mode: "create" | "edit";
  display_name: string;
  act_type?: string;
  bio?: string;
  social_link?: string;
  portfolio_link?: string;
  first_time_flag?: boolean;
  proof_of_work_link?: string;
  profile_picture_url?: string | null;
  area?: string;
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = (await request.json()) as Body;

  if (!body.display_name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  // A general area only, for distance-based matching — never a physical
  // destination, so unlike a venue's address this doesn't need a booking
  // gate. Geocoding failure (or an empty field) just leaves it unset.
  const location = body.area?.trim() ? await geocodeAddress(body.area).catch(() => null) : null;

  const payload = {
    display_name: body.display_name,
    act_type: body.act_type || null,
    bio: body.bio || null,
    social_links: body.social_link ? { primary: body.social_link } : {},
    portfolio_links: body.portfolio_link ? [{ url: body.portfolio_link }] : [],
    first_time_flag: Boolean(body.first_time_flag),
    proof_of_work_links: body.proof_of_work_link ? [{ url: body.proof_of_work_link }] : [],
    profile_picture_url: body.profile_picture_url ?? null,
    ...(location && {
      lat: location.lat,
      lng: location.lng,
      city: location.city,
      locality: location.locality,
      state: location.state,
    }),
  };

  const { error } =
    body.mode === "edit"
      ? await supabase.from("performer_profiles").update(payload).eq("user_id", user.id)
      : await supabase.from("performer_profiles").insert({ user_id: user.id, ...payload });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, geocoded: Boolean(location) });
}
