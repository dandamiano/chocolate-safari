import type { User } from "@supabase/supabase-js";

export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS?.trim() ?? "";
  if (!raw) return [];
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminUser(user: User | null | undefined): boolean {
  if (!user?.email) return false;

  const email = user.email.toLowerCase();
  const allowlist = getAdminEmails();
  if (allowlist.includes(email)) return true;

  const role = user.user_metadata?.role;
  return role === "admin";
}
