"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/layout/AuthShell";
import { FieldLabel, FieldInput } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [forgotMode, setForgotMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();

    if (forgotMode) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
      });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      setResetSent(true);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/home");
    router.refresh();
  }

  return (
    <AuthShell title="Log in">
      <form className="pb-8 sm:pb-0" onSubmit={handleSubmit}>
        <FieldLabel>Email</FieldLabel>
        <FieldInput
          type="email"
          placeholder="name@email.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {!forgotMode && (
          <>
            <FieldLabel>Password</FieldLabel>
            <FieldInput
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </>
        )}
        <button
          type="button"
          onClick={() => {
            setForgotMode((v) => !v);
            setError(null);
            setResetSent(false);
          }}
          className="mt-2.5 block text-xs font-semibold text-accent-ink"
        >
          {forgotMode ? "Back to log in" : "Forgot password?"}
        </button>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        {resetSent && (
          <p className="mt-2 text-xs text-verified-ink">
            Check your inbox for a password reset link.
          </p>
        )}
        <Button type="submit" block className="mt-4" disabled={loading}>
          {loading
            ? "Please wait…"
            : forgotMode
              ? "Send reset link"
              : "Log in"}
        </Button>
        <p className="mt-4 text-center text-xs text-ink-2">
          New to StageSpot?{" "}
          <Link href="/signup" className="font-semibold text-accent-ink">
            Create an account
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
