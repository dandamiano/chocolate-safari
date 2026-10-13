"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AuthActionState = {
  ok: boolean;
  message?: string;
};

async function getRequestOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host");
  if (!host) return "http://127.0.0.1:43127";
  const proto = h.get("x-forwarded-proto") || "http";
  return `${proto}://${host}`;
}

function safeNext(raw: FormDataEntryValue | null, fallback = "/tasting-log"): string {
  const next = String(raw ?? "").trim();
  return next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

/** Public email/password sign-in (distinct from /admin/login). */
export async function publicSignInAction(
  _prev: AuthActionState | null,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  if (!email || !password) {
    return { ok: false, message: "Email and password are required." };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { ok: false, message: error.message };
    }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Sign-in failed. Check SUPABASE_URL and SUPABASE_ANON_KEY.",
    };
  }

  redirect(next);
}

/** Public email/password sign-up. */
export async function publicSignUpAction(
  _prev: AuthActionState | null,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  if (!email || !password) {
    return { ok: false, message: "Email and password are required." };
  }
  if (password.length < 6) {
    return { ok: false, message: "Password must be at least 6 characters." };
  }

  try {
    const origin = await getRequestOrigin();
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) {
      return { ok: false, message: error.message };
    }
    // When email confirmation is disabled, session is present immediately.
    if (data.session) {
      redirect(next);
    }
    return {
      ok: true,
      message: "Check your inbox to confirm your email, then sign in.",
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Sign-up failed. Check SUPABASE_URL and SUPABASE_ANON_KEY.",
    };
  }
}

export async function publicSignOutAction(): Promise<void> {
  try {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  } catch {
    // Ignore missing config — still leave the page.
  }
  redirect("/");
}
