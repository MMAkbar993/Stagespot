import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Secret-key client. Bypasses RLS — only import from server-only code
 * (route handlers, server actions) that has already verified the caller is an admin.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
