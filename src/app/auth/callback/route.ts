import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * PKCE callback for magic-link sign-in.
 * Exchanges ?code= for a session cookie using server-only SUPABASE_* env vars.
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextRaw = requestUrl.searchParams.get("next") ?? "/admin";
  const next = nextRaw.startsWith("/") ? nextRaw : "/admin";

  if (code) {
    try {
      const supabase = await createServerSupabaseClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(new URL(next, requestUrl.origin));
      }
    } catch {
      // Fall through to login error
    }
  }

  const login = new URL("/admin/login", requestUrl.origin);
  login.searchParams.set("error", "auth");
  return NextResponse.redirect(login);
}
