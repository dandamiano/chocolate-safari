import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminUser } from "@/lib/admin/allowlist";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase-env";

/**
 * Refresh the auth session on matched routes and gate /admin/* (except login).
 * Next.js 16 uses proxy.ts instead of middleware.ts.
 * Uses server-only SUPABASE_* env vars + cookies (no NEXT_PUBLIC_* required).
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  const path = request.nextUrl.pathname;
  const isAdminPath = path.startsWith("/admin");
  const isLogin = path === "/admin/login";

  if (!url || !anonKey) {
    // Without Supabase, only allow the login page so we can show a config message.
    if (isAdminPath && !isLogin) {
      const login = new URL("/admin/login", request.url);
      login.searchParams.set("error", "config");
      return NextResponse.redirect(login);
    }
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isAdminPath) {
    return response;
  }

  if (isLogin) {
    if (user && isAdminUser(user)) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return response;
  }

  if (!user || !isAdminUser(user)) {
    const login = new URL("/admin/login", request.url);
    if (user && !isAdminUser(user)) {
      login.searchParams.set("error", "forbidden");
    }
    return NextResponse.redirect(login);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Refresh session cookies on app routes; still gate /admin in the handler.
     * Skip static assets and images.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
