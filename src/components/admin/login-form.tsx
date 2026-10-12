"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { adminInputClass, Field } from "@/components/admin/field";

export function LoginForm({
  configured,
}: {
  configured: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [magicSent, setMagicSent] = useState(false);

  if (!configured) {
    return (
      <p className="rounded-lg border border-border bg-bg-elevated p-4 text-sm text-text-muted">
        Set <code className="text-brass">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
        <code className="text-brass">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> (plus
        server keys and <code className="text-brass">ADMIN_EMAILS</code>) to
        enable admin login. See the README.
      </p>
    );
  }

  function onPasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    startTransition(async () => {
      try {
        const supabase = createBrowserSupabaseClient();
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          setError(signInError.message);
          return;
        }
        router.replace("/admin");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Sign-in failed");
      }
    });
  }

  function onMagicSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMagicSent(false);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("magicEmail") ?? "").trim();

    startTransition(async () => {
      try {
        const supabase = createBrowserSupabaseClient();
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/admin`,
          },
        });
        if (otpError) {
          setError(otpError.message);
          return;
        }
        setMagicSent(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Magic link failed");
      }
    });
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onPasswordSubmit} className="space-y-4">
        <Field label="Email">
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className={adminInputClass}
          />
        </Field>
        <Field label="Password">
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className={adminInputClass}
          />
        </Field>
        {error ? (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="border-t border-border pt-6">
        <p className="mb-3 text-sm text-text-muted">
          Or receive a magic link (enable Email provider in Supabase Auth).
        </p>
        <form onSubmit={onMagicSubmit} className="space-y-4">
          <Field label="Email for magic link">
            <input
              name="magicEmail"
              type="email"
              required
              autoComplete="email"
              className={adminInputClass}
            />
          </Field>
          {magicSent ? (
            <p className="text-sm text-brass">Check your inbox for the link.</p>
          ) : null}
          <Button
            type="submit"
            variant="outline"
            disabled={pending}
            className="w-full"
          >
            Send magic link
          </Button>
        </form>
      </div>
    </div>
  );
}
