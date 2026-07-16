"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/layout/AuthShell";
import { FieldLabel, FieldInput } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/home");
  }

  return (
    <AuthShell title="Set a new password" backHref="/login">
      <form className="pb-8 sm:pb-0" onSubmit={handleSubmit}>
        <FieldLabel>New password</FieldLabel>
        <FieldInput
          type="password"
          placeholder="••••••••"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        <Button type="submit" block className="mt-5" disabled={loading}>
          {loading ? "Saving…" : "Save password"}
        </Button>
      </form>
    </AuthShell>
  );
}
