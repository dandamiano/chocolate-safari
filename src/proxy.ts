import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminUser } from "@/lib/admin/allowlist";

/**
 * Refresh the auth session and gate /admin/* (except /admin/login).
 * Next.js 16 uses proxy.ts instead of middleware.ts.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim();
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    // Without Supabase, only allow the login page so we can show a config message.
    if (
      request.nextUrl.pathname.startsWith("/admin") &&
      request.nextUrl.pathname !== "/admin/login"
    ) {
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

  const path = request.nextUrl.pathname;
  const isAdminPath = path.startsWith("/admin");
  const isLogin = path === "/admin/login";

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
  matcher: ["/admin", "/admin/:path*"],
};
