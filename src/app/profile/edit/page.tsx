import { requireProfile } from "@/lib/auth/guards";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { PerformerProfileForm } from "@/components/forms/PerformerProfileForm";
import { VenueProfileForm } from "@/components/forms/VenueProfileForm";
import type { PerformerProfile, VenueProfile } from "@/lib/types";

const statusVariant = {
  pending: "pending",
  approved: "verified",
  rejected: "rejected",
} as const;

export default async function EditProfilePage() {
  const { role, profile } = await requireProfile();

  if (role === "admin") {
    return (
      <AppShell title="Edit profile" back>
        <div className="mx-auto max-w-md pb-8 sm:pb-0">
          <div className="mb-6 text-lg font-semibold text-ink">Admin account</div>
          <SignOutButton />
        </div>
      </AppShell>
    );
  }

  const status = profile?.verification_status;

  return (
    <AppShell title="Edit profile" back>
      <div className="mx-auto max-w-md pb-8 sm:pb-0">
        {status && (
          <div className="mb-5">
            <Badge variant={statusVariant[status]}>
              {status === "pending"
                ? "Pending verification"
                : status === "approved"
                  ? "Verified"
                  : "Rejected"}
            </Badge>
            {status === "rejected" && profile?.rejection_reason && (
              <p className="mt-2 text-xs text-red-600">{profile.rejection_reason}</p>
            )}
          </div>
        )}

        {role === "venue" ? (
          <VenueProfileForm
            mode="edit"
            initialValues={profile as VenueProfile}
            redirectTo={`/venues/${(profile as VenueProfile).user_id}`}
          />
        ) : (
          <PerformerProfileForm
            mode="edit"
            initialValues={profile as PerformerProfile}
            redirectTo={`/performers/${(profile as PerformerProfile).user_id}`}
          />
        )}

        <div className="mt-6">
          <SignOutButton />
        </div>
      </div>
    </AppShell>
  );
}
