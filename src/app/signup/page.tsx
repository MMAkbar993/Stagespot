"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/layout/AuthShell";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { FieldLabel, FieldInput, CheckboxRow } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

function SignUpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const initialRole = params.get("role") === "venue" ? "venue" : "performer";
  const [role, setRole] = useState<"performer" | "venue">(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(`/verify-email?email=${encodeURIComponent(email)}`);
  }

  return (
    <form className="pb-8 sm:pb-0" onSubmit={handleSubmit}>
      <FieldLabel>I am a</FieldLabel>
      <SegmentedControl
        value={role}
        onChange={setRole}
        options={[
          { value: "performer", label: "Performer" },
          { value: "venue", label: "Venue" },
        ]}
      />
      <FieldLabel>Email</FieldLabel>
      <FieldInput
        type="email"
        placeholder="name@email.com"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <FieldLabel>Password</FieldLabel>
      <FieldInput
        type="password"
        placeholder="••••••••"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <CheckboxRow required>
        I agree to the{" "}
        <Link href="/terms" className="font-semibold text-accent-ink">
          Terms and Conditions
        </Link>
      </CheckboxRow>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <Button type="submit" block className="mt-5" disabled={loading}>
        {loading ? "Creating account…" : "Create account"}
      </Button>
      <p className="mt-4 text-center text-xs text-ink-2">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-accent-ink">
          Log in
        </Link>
      </p>
    </form>
  );
}

export default function SignUpPage() {
  return (
    <AuthShell title="Create account">
      <Suspense fallback={null}>
        <SignUpForm />
      </Suspense>
    </AuthShell>
  );
}
