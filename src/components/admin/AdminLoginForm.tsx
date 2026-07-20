"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/layout/AuthShell";
import { FieldLabel, FieldInput } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function AdminLoginForm({ deniedRole }: { deniedRole?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    deniedRole ? "That account isn't an admin account." : null,
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setLoading(false);
      setError(signInError.message);
      return;
    }

    const { data: profileRow } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profileRow?.role !== "admin") {
      await supabase.auth.signOut();
      setLoading(false);
      setError("That account isn't an admin account.");
      return;
    }

    router.refresh();
  }

  return (
    <AuthShell title="Admin login">
      <form className="pb-8 sm:pb-0" onSubmit={handleSubmit}>
        <FieldLabel>Admin email</FieldLabel>
        <FieldInput
          type="email"
          placeholder="admin@stagespot.app"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FieldLabel>Password</FieldLabel>
        <FieldInput
          type="password"
          placeholder="••••••••"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        <Button type="submit" block className="mt-4" disabled={loading}>
          {loading ? "Logging in…" : "Log in to admin"}
        </Button>
      </form>
    </AuthShell>
  );
}
