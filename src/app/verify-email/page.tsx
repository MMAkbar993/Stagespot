"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/layout/AuthShell";
import { Button } from "@/components/ui/Button";

function VerifyEmailContent() {
  const params = useSearchParams();
  const email = params.get("email");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleResend() {
    if (!email) return;
    setStatus("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setStatus(error ? "error" : "sent");
  }

  return (
    <div className="pb-10 pt-2 text-center sm:pt-0">
      <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-accent-soft" />
      <h2 className="mb-2 text-base font-semibold text-ink">
        Check your inbox
      </h2>
      <p className="mx-auto mb-6 max-w-xs text-sm leading-relaxed text-ink-2">
        We sent a verification link to{" "}
        {email ? <strong className="text-ink">{email}</strong> : "your email"}.
        Click it to activate your account.
      </p>
      {status === "sent" && (
        <p className="mb-3 text-xs text-verified-ink">Verification email resent.</p>
      )}
      {status === "error" && (
        <p className="mb-3 text-xs text-red-600">
          Couldn&apos;t resend right now — try again shortly.
        </p>
      )}
      <Button
        variant="ghost"
        block
        disabled={!email || status === "sending"}
        onClick={handleResend}
      >
        {status === "sending" ? "Resending…" : "Resend email"}
      </Button>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthShell title="Verify email" backHref="/signup">
      <Suspense fallback={null}>
        <VerifyEmailContent />
      </Suspense>
    </AuthShell>
  );
}
