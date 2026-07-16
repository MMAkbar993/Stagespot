"use client";

import { useState } from "react";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ButtonLink } from "@/components/ui/Button";

export function EntryToggle() {
  const [role, setRole] = useState<"performer" | "venue">("performer");

  return (
    <div>
      <SegmentedControl
        value={role}
        onChange={setRole}
        options={[
          { value: "performer", label: "I'm a Performer" },
          { value: "venue", label: "I'm a Venue" },
        ]}
      />
      <ButtonLink
        href={`/signup?role=${role}`}
        variant="primary"
        block
        className="mt-3"
      >
        Continue
      </ButtonLink>
    </div>
  );
}
