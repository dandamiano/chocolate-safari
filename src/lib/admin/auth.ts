import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { isAdminUser } from "@/lib/admin/allowlist";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getSessionUser(): Promise<User | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return data.user;
  } catch {
    return null;
  }
}

/** Returns the signed-in admin user or redirects to login / home. */
export async function requireAdmin(): Promise<User> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/admin/login");
  }
  if (!isAdminUser(user)) {
    redirect("/admin/login?error=forbidden");
  }
  return user;
}

export async function requireAdminForAction(): Promise<User> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("Not signed in");
  }
  if (!isAdminUser(user)) {
    throw new Error("Not authorized as admin");
  }
  return user;
}
