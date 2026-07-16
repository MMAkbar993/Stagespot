import { requireProfile } from "@/lib/auth/guards";

export default async function ExploreLayout({ children }: { children: React.ReactNode }) {
  await requireProfile();
  return <>{children}</>;
}
