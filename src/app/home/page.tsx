import { requireProfile } from "@/lib/auth/guards";
import { getApprovedPerformers, getOpenGigs } from "@/lib/data/discovery";
import { HomeFeed } from "@/components/discovery/HomeFeed";

export default async function HomePage() {
  const { supabase, role } = await requireProfile();
  const [performers, gigs] = await Promise.all([
    getApprovedPerformers(supabase, 20),
    getOpenGigs(supabase, 20),
  ]);

  return <HomeFeed performers={performers} gigs={gigs} viewerRole={role} />;
}
