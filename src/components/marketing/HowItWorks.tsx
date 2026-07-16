const performerSteps = [
  "Create your profile",
  "Get verified by admin",
  "Apply to open gigs",
  "Perform",
];

const venueSteps = [
  "Create your venue profile",
  "Get verified by admin",
  "Post a gig",
  "Host a show",
];

function StepList({
  heading,
  steps,
}: {
  heading: string;
  steps: string[];
}) {
  return (
    <div className="flex-1 rounded-2xl border border-line bg-surface p-5">
      <div className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-2">
        {heading}
      </div>
      <ol className="space-y-3">
        {steps.map((step, i) => (
          <li key={step} className="flex items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent-ink">
              {i + 1}
            </span>
            <span className="text-sm text-ink">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h2 className="mb-6 text-center text-xl font-bold text-ink sm:text-2xl">
        How it works
      </h2>
      <div className="flex flex-col gap-4 sm:flex-row">
        <StepList heading="For performers" steps={performerSteps} />
        <StepList heading="For venues" steps={venueSteps} />
      </div>
    </section>
  );
}
