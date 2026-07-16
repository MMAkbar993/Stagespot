import { requireProfile } from "@/lib/auth/guards";
import { AppShell } from "@/components/layout/AppShell";
import { PostGigForm } from "@/components/forms/PostGigForm";
import type { VenueProfile } from "@/lib/types";

export default async function PostGigPage() {
  const { role, profile } = await requireProfile();

  if (role !== "venue") {
    return (
      <AppShell title="Post a gig" back>
        <p className="py-10 text-center text-sm text-ink-2">
          Only venues can post gigs.
        </p>
      </AppShell>
    );
  }

  const venue = profile as VenueProfile;

  if (venue.verification_status !== "approved") {
    return (
      <AppShell title="Post a gig" back>
        <div className="mx-auto max-w-md py-10 text-center">
          <p className="text-sm text-ink-2">
            {venue.verification_status === "rejected"
              ? "Your venue's verification was rejected, so you can't post gigs yet."
              : "Your venue is still pending admin verification. You can post gigs once it's approved."}
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Post a gig" back>
      <div className="mx-auto max-w-md pb-8 sm:pb-0">
        <PostGigForm />
      </div>
    </AppShell>
  );
}
