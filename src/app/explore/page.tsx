import { requireProfile } from "@/lib/auth/guards";
import { getApprovedPerformers, getOpenGigs } from "@/lib/data/discovery";
import { ExploreFeed } from "@/components/discovery/ExploreFeed";

export default async function ExplorePage() {
  const { supabase } = await requireProfile();
  const [performers, gigs] = await Promise.all([
    getApprovedPerformers(supabase, 50),
    getOpenGigs(supabase, 50),
  ]);

  return <ExploreFeed performers={performers} gigs={gigs} />;
}
