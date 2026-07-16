import { requireProfile } from "@/lib/auth/guards";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { SignOutButton } from "@/components/auth/SignOutButton";

const statusVariant = {
  pending: "pending",
  approved: "verified",
  rejected: "rejected",
} as const;

export default async function EditProfilePage() {
  const { role, profile } = await requireProfile();

  const typedProfile = profile as {
    display_name?: string;
    venue_name?: string;
    verification_status?: keyof typeof statusVariant;
  } | null;

  const name =
    role === "venue"
      ? typedProfile?.venue_name
      : role === "performer"
        ? typedProfile?.display_name
        : "Admin";
  const status = typedProfile?.verification_status;

  return (
    <AppShell title="Edit profile" back>
      <div className="mx-auto max-w-md pb-8 sm:pb-0">
        <div className="mb-1 text-lg font-semibold text-ink">{name}</div>
        <div className="mb-4 text-xs capitalize text-ink-2">{role}</div>
        {status && (
          <div className="mb-6">
            <Badge variant={statusVariant[status]}>
              {status === "pending"
                ? "Pending verification"
                : status === "approved"
                  ? "Verified"
                  : "Rejected"}
            </Badge>
          </div>
        )}
        <p className="mb-6 text-sm leading-relaxed text-ink-2">
          Full profile editing is coming in a later build phase. You can sign
          out below.
        </p>
        <SignOutButton />
      </div>
    </AppShell>
  );
}
