import { requireProfile } from "@/lib/auth/guards";

export default async function BookingsLayout({ children }: { children: React.ReactNode }) {
  await requireProfile();
  return <>{children}</>;
}
