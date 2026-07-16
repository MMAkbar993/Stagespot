import Link from "next/link";
import { CheckboxRow } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const sections = [
  {
    heading: "Platform rules",
    body: "StageSpot connects first-time and hobbyist performers with cafes and restaurants hosting open mic nights in the Delhi region. Accounts must be truthful, respectful, and used only for their intended purpose of arranging live performances.",
  },
  {
    heading: "Verification",
    body: "Every performer and venue profile is reviewed by an admin before it can apply to or post gigs. Performers must submit a link to their portfolio or social media presence; venues must submit proof of business, photos, and address details. Admin may reject a profile with a stated reason, and rejected accounts may resubmit once the issue is addressed.",
  },
  {
    heading: "Bookings and conduct",
    body: "Bookings move through requested, accepted, and confirmed stages before contact details and exact address are shared. Both sides are expected to follow through on confirmed bookings; either side may decline before acceptance or cancel after acceptance, but repeated cancellations may affect verification status. Feedback left after a completed booking should be honest and respectful.",
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6 sm:py-12">
      <h1 className="mb-6 text-xl font-bold text-ink sm:text-2xl">
        Terms and Conditions
      </h1>
      <div className="space-y-6">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-2">
              {section.heading}
            </h2>
            <p className="text-sm leading-relaxed text-ink">{section.body}</p>
          </section>
        ))}
      </div>

      <form className="mt-8 border-t border-line pt-6">
        <CheckboxRow>I agree to the terms and conditions</CheckboxRow>
        <Button type="submit" block className="mt-4">
          Continue
        </Button>
        <p className="mt-4 text-center text-xs text-ink-2">
          <Link href="/" className="font-semibold text-accent-ink">
            Back to home
          </Link>
        </p>
      </form>
    </div>
  );
}
