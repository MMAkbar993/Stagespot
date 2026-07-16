import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const actionToStatus = {
  accept: "accepted",
  decline: "declined",
  confirm: "confirmed",
  cancel: "cancelled",
} as const;

type Action = keyof typeof actionToStatus;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { bookingId, action } = (await request.json()) as { bookingId: string; action: Action };

  if (!bookingId || !(action in actionToStatus)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // RLS restricts the row to participants/admin; the enforce_booking_transition
  // trigger validates the transition itself (who may act, from which status).
  const { error } = await supabase
    .from("bookings")
    .update({ status: actionToStatus[action] })
    .eq("id", bookingId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
