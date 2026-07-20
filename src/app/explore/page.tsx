import { requireProfile } from "@/lib/auth/guards";
import { getApprovedPerformers, getOpenGigs } from "@/lib/data/discovery";
import { ExploreFeed } from "@/components/discovery/ExploreFeed";
import type { PerformerProfile, VenueProfile } from "@/lib/types";

export default async function ExplorePage() {
  const { supabase, role, profile } = await requireProfile();
  const [performers, gigs] = await Promise.all([
    getApprovedPerformers(supabase, 50),
    getOpenGigs(supabase, 50),
  ]);

  const typedProfile = profile as PerformerProfile | VenueProfile | null;
  const viewerLocation =
    typedProfile?.lat != null && typedProfile?.lng != null
      ? { lat: typedProfile.lat, lng: typedProfile.lng }
      : null;

  return (
    <ExploreFeed
      performers={performers}
      gigs={gigs}
      viewerRole={role === "admin" ? null : role}
      viewerLocation={viewerLocation}
    />
  );
}
