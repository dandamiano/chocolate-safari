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
      <p className="rounded-lg border border-border bg-bg-elevated/80 px-4 py-5 text-center text-sm leading-relaxed text-text-muted">
        Admin isn’t configured yet.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <form action={passwordAction} className="space-y-4">
        <Field label="Email">
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
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
        <Button
          type="submit"
          disabled={pending}
          size="lg"
          className="h-11 w-full bg-brass text-bg-base hover:bg-brass-hover"
        >
          {passwordPending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <div className="w-full border-t border-border/60" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-bg-base px-3 text-xs text-text-muted">or</span>
        </div>
      </div>

      <form action={magicAction} className="space-y-3">
        <Field label="Email for magic link">
          <input
            name="magicEmail"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className={adminInputClass}
          />
        </Field>
        {magicSent ? (
          <p className="text-center text-sm text-brass">
            {magicState?.message ?? "Check your inbox for the link."}
          </p>
        ) : null}
        <Button
          type="submit"
          variant="ghost"
          disabled={pending}
          className="h-10 w-full text-text-muted hover:bg-bg-elevated hover:text-brass"
        >
          {magicPending ? "Sending…" : "Email me a magic link"}
        </Button>
      </form>
    </div>
  );
}
