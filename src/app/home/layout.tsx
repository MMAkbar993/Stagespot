import { requireProfile } from "@/lib/auth/guards";

export default async function HomeLayout({ children }: { children: React.ReactNode }) {
  await requireProfile();
  return <>{children}</>;
}
