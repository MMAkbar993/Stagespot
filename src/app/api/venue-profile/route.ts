import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { geocodeAddress } from "@/lib/geocode";

type Body = {
  mode: "create" | "edit";
  venue_name: string;
  address: string;
  act_types_wanted?: string;
  photos?: string[];
  social_link?: string;
  first_time_hosting?: boolean;
  proof_of_business_link?: string;
  profile_picture_url?: string | null;
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

  if (!body.venue_name?.trim() || !body.address?.trim()) {
    return NextResponse.json({ error: "Venue name and address are required" }, { status: 400 });
  }

  const location = await geocodeAddress(body.address).catch(() => null);

  // The exact address is kept out of venue_profiles entirely (Section 5.6 —
  // stays hidden until a booking is confirmed) and lives in its own
  // separately-RLS'd table instead.
  const payload = {
    venue_name: body.venue_name,
    act_types_wanted: body.act_types_wanted ? [body.act_types_wanted] : [],
    photos: (body.photos ?? []).filter(Boolean).map((url) => ({ url })),
    social_links: body.social_link ? { primary: body.social_link } : {},
    first_time_hosting: Boolean(body.first_time_hosting),
    proof_of_business_links: body.proof_of_business_link
      ? [{ url: body.proof_of_business_link }]
      : [],
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
      ? await supabase.from("venue_profiles").update(payload).eq("user_id", user.id)
      : await supabase.from("venue_profiles").insert({ user_id: user.id, ...payload });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { error: addressError } =
    body.mode === "edit"
      ? await supabase
          .from("venue_private_details")
          .update({ address: body.address })
          .eq("user_id", user.id)
      : await supabase
          .from("venue_private_details")
          .insert({ user_id: user.id, address: body.address });

  if (addressError) {
    return NextResponse.json({ error: addressError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, geocoded: Boolean(location) });
}
