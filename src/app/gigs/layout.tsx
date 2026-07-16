import { requireProfile } from "@/lib/auth/guards";

export default async function GigsLayout({ children }: { children: React.ReactNode }) {
  await requireProfile();
  return <>{children}</>;
}
