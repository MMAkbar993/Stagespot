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

  const payload = {
    venue_name: body.venue_name,
    address: body.address,
    act_types_wanted: body.act_types_wanted ? [body.act_types_wanted] : [],
    photos: (body.photos ?? []).filter(Boolean).map((url) => ({ url })),
    social_links: body.social_link ? { primary: body.social_link } : {},
    first_time_hosting: Boolean(body.first_time_hosting),
    proof_of_business_links: body.proof_of_business_link
      ? [{ url: body.proof_of_business_link }]
      : [],
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

  return NextResponse.json({ success: true, geocoded: Boolean(location) });
}
