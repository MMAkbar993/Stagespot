"use client";

import { AppShell } from "@/components/layout/AppShell";
import { FieldLabel, FieldInput, FieldTextarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export default function PostGigPage() {
  return (
    <AppShell title="Post a gig" back>
      <div className="mx-auto max-w-md pb-8 sm:pb-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // Wired to a gigs insert (verified venues only) in a later build phase.
          }}
        >
          <FieldLabel>Date</FieldLabel>
          <FieldInput type="date" required />
          <FieldLabel>Time window</FieldLabel>
          <FieldInput placeholder="e.g. 7pm to 9pm" required />
          <FieldLabel>Act type needed</FieldLabel>
          <FieldInput placeholder="Music / comedy / poetry / other" />
          <FieldLabel>Notes</FieldLabel>
          <FieldTextarea rows={3} placeholder="Mic available, indoor or outdoor" />
          <Button type="submit" block className="mt-5">
            Post gig
          </Button>
        </form>
      </div>
    </AppShell>
  );
}
