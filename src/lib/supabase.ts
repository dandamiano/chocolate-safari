import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Canonical server-only env vars. Falls back to NEXT_PUBLIC_* for one release
 * so existing .env.local files keep working.
 */
function getSupabaseUrl(): string | undefined {
  return (
    process.env.SUPABASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    undefined
  );
}

function getSupabaseAnonKey(): string | undefined {
  return (
    process.env.SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    // New Supabase dashboard label for the anon / publishable key
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    undefined
  );
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

let serverClient: SupabaseClient | null = null;

/** Anon client for server-side reads. Returns null when env vars are missing. */
export function getSupabaseAnon(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (serverClient) return serverClient;

  serverClient = createClient(getSupabaseUrl()!, getSupabaseAnonKey()!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return serverClient;
}

/** Service-role client for seed / admin scripts only. Never expose to the browser. */
export function getSupabaseServiceRole(): SupabaseClient {
  const url = getSupabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) or SUPABASE_SERVICE_ROLE_KEY for seed."
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
