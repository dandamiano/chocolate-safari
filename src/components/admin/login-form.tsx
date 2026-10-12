"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  signInWithMagicLinkAction,
  signInWithPasswordAction,
  type AuthActionState,
} from "@/lib/admin/actions";
import { adminInputClass, Field } from "@/components/admin/field";

const initialState: AuthActionState | null = null;

export function LoginForm({
  configured,
}: {
  configured: boolean;
}) {
  const [passwordState, passwordAction, passwordPending] = useActionState(
    signInWithPasswordAction,
    initialState
  );
  const [magicState, magicAction, magicPending] = useActionState(
    signInWithMagicLinkAction,
    initialState
  );

  const pending = passwordPending || magicPending;
  const error =
    passwordState && !passwordState.ok
      ? passwordState.message
      : magicState && !magicState.ok
        ? magicState.message
        : null;
  const magicSent = Boolean(magicState?.magicSent);

  if (!configured) {
    return (
      <p className="rounded-lg border border-border bg-bg-elevated p-4 text-sm text-text-muted">
        Set <code className="text-brass">SUPABASE_URL</code>,{" "}
        <code className="text-brass">SUPABASE_ANON_KEY</code>,{" "}
        <code className="text-brass">SUPABASE_SERVICE_ROLE_KEY</code>, and{" "}
        <code className="text-brass">ADMIN_EMAILS</code> to enable admin login.
        See the README.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <form action={passwordAction} className="space-y-4">
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
          {passwordPending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="border-t border-border pt-6">
        <p className="mb-3 text-sm text-text-muted">
          Or receive a magic link (enable Email provider in Supabase Auth).
        </p>
        <form action={magicAction} className="space-y-4">
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
            <p className="text-sm text-brass">
              {magicState?.message ?? "Check your inbox for the link."}
            </p>
          ) : null}
          <Button
            type="submit"
            variant="outline"
            disabled={pending}
            className="w-full"
          >
            {magicPending ? "Sending…" : "Send magic link"}
          </Button>
        </form>
      </div>
    </div>
  );
}
