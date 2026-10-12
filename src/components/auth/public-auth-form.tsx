"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { adminInputClass, Field } from "@/components/admin/field";
import {
  publicSignInAction,
  publicSignUpAction,
  type AuthActionState,
} from "@/lib/auth/actions";

const initialState: AuthActionState | null = null;

export function PublicAuthForm({
  mode,
  next = "/tasting-log",
  configured,
}: {
  mode: "login" | "signup";
  next?: string;
  configured: boolean;
}) {
  const action = mode === "login" ? publicSignInAction : publicSignUpAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  if (!configured) {
    return (
      <p className="rounded-lg border border-border bg-bg-elevated/80 px-4 py-5 text-center text-sm leading-relaxed text-text-muted">
        Accounts aren’t configured yet. Set{" "}
        <code className="text-brass">SUPABASE_URL</code> and{" "}
        <code className="text-brass">SUPABASE_ANON_KEY</code>.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="next" value={next} />
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
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={6}
            className={adminInputClass}
          />
        </Field>
        {state && !state.ok ? (
          <p className="text-sm text-red-400" role="alert">
            {state.message}
          </p>
        ) : null}
        {state?.ok && state.message ? (
          <p className="text-sm text-brass" role="status">
            {state.message}
          </p>
        ) : null}
        <Button
          type="submit"
          disabled={pending}
          size="lg"
          className="h-11 w-full bg-brass text-bg-base hover:bg-brass-hover"
        >
          {pending
            ? mode === "login"
              ? "Signing in…"
              : "Creating account…"
            : mode === "login"
              ? "Sign in"
              : "Create account"}
        </Button>
      </form>

      <p className="text-center text-sm text-text-muted">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link href={`/signup?next=${encodeURIComponent(next)}`} className="text-brass hover:underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already tasting?{" "}
            <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-brass hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>
      <p className="text-center text-xs text-text-muted">
        Site staff use{" "}
        <Link href="/admin/login" className="text-text-muted underline-offset-2 hover:text-brass hover:underline">
          /admin/login
        </Link>
        .
      </p>
    </div>
  );
}
