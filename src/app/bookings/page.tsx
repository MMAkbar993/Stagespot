import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ListCard } from "@/components/ui/ListCard";
import { mockBookings } from "@/lib/mock-data";

export default function MyBookingsPage() {
  return (
    <AppShell title="My Bookings" back>
      <div className="mx-auto grid max-w-3xl gap-2.5 sm:grid-cols-2">
        {mockBookings.map((b) => (
          <Link key={b.id} href={`/bookings/${b.id}`} className="block">
            <ListCard title={b.title} status={b.status} meta={b.meta} />
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
