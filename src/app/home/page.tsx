import { requireProfile } from "@/lib/auth/guards";
import { getApprovedPerformers, getOpenGigs } from "@/lib/data/discovery";
import { HomeFeed } from "@/components/discovery/HomeFeed";
import type { PerformerProfile, VenueProfile } from "@/lib/types";

export default async function HomePage() {
  const { supabase, role, profile } = await requireProfile();
  const [performers, gigs] = await Promise.all([
    getApprovedPerformers(supabase, 20),
    getOpenGigs(supabase, 20),
  ]);

  const typedProfile = profile as PerformerProfile | VenueProfile | null;
  const viewerLocation =
    typedProfile?.lat != null && typedProfile?.lng != null
      ? { lat: typedProfile.lat, lng: typedProfile.lng }
      : null;

  return (
    <HomeFeed performers={performers} gigs={gigs} viewerRole={role} viewerLocation={viewerLocation} />
  );
}
