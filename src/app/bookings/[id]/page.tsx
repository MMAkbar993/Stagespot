import { AppShell } from "@/components/layout/AppShell";
import { FieldLabel, FieldInput } from "@/components/ui/Field";

// Placeholder — replaced by a real booking lookup by `id` in a later build phase.
// Contact/address fields below are only populated once status = "confirmed".
const mockBooking = {
  venue: "The Wren Cafe, full address in Delhi region",
  schedule: "Friday, 7pm to 9pm",
  contact: "+91 98xxxxxxx now visible",
};

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;
  const booking = mockBooking;

  return (
    <AppShell title="Booking" back>
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-3 flex h-13 w-13 items-center justify-center rounded-full bg-verified-soft">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 13l4 4L19 7"
              stroke="#3F5E33"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="mb-1 text-base font-semibold text-ink">
          Booking confirmed
        </div>
        <p className="mb-5 text-sm text-ink-2">
          Both sides are locked in. Full details below.
        </p>
        <div className="text-left">
          <FieldLabel>Venue</FieldLabel>
          <FieldInput readOnly value={booking.venue} />
          <FieldLabel>Date and time</FieldLabel>
          <FieldInput readOnly value={booking.schedule} />
          <FieldLabel>Contact</FieldLabel>
          <FieldInput readOnly value={booking.contact} />
        </div>
      </div>
    </AppShell>
  );
}
