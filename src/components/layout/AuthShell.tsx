import Link from "next/link";

export function AuthShell({
  title,
  backHref = "/",
  children,
}: {
  title: string;
  backHref?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col sm:items-center sm:justify-center sm:bg-canvas sm:py-12">
      <div className="flex items-center gap-3 px-4 py-4 sm:hidden">
        <Link href={backHref} className="text-lg text-ink" aria-label="Back">
          &#8592;
        </Link>
        <span className="text-base font-semibold text-ink">{title}</span>
      </div>
      <div className="flex-1 px-4 sm:w-full sm:max-w-sm sm:flex-none sm:rounded-2xl sm:border sm:border-line sm:bg-surface sm:p-8 sm:shadow-sm">
        <div className="mb-6 hidden text-center sm:block">
          <h1 className="text-xl font-bold text-ink">{title}</h1>
        </div>
        {children}
      </div>
    </div>
  );
}
