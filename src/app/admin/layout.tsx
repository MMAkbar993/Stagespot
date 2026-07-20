// Auth is handled inside page.tsx (renders its own login form when not an
// admin, rather than redirecting away) so this layout stays a passthrough.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
