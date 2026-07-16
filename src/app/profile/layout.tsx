import { requireProfile } from "@/lib/auth/guards";

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  await requireProfile();
  return <>{children}</>;
}
