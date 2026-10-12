import Link from "next/link";
import { LoginForm } from "@/components/admin/login-form";
import { isSupabaseConfigured } from "@/lib/supabase-env";

export const metadata = {
  title: "Admin login",
};

const ERROR_COPY: Record<string, string> = {
  forbidden:
    "You are signed in, but this account is not on ADMIN_EMAILS and does not have role=admin.",
  config:
    "Supabase Auth is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY.",
  auth: "Sign-in link expired or invalid. Try again.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const configured = isSupabaseConfigured();
  const errorMessage = params.error
    ? ERROR_COPY[params.error] ?? null
    : null;

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-4 py-16">
      <p className="section-label mb-2">Chocolate Safari</p>
      <h1 className="font-display text-3xl text-text-on-dark">Admin login</h1>
      <p className="mt-2 text-sm text-text-muted">
        Sign in with a Supabase Auth user allowlisted via{" "}
        <code className="text-brass">ADMIN_EMAILS</code> or{" "}
        <code className="text-brass">user_metadata.role = admin</code>.
      </p>

      {errorMessage ? (
        <p className="mt-4 rounded-lg border border-red-500/40 bg-red-950/40 p-3 text-sm text-red-200">
          {errorMessage}
        </p>
      ) : null}

      <div className="mt-8">
        <LoginForm configured={configured} />
      </div>

      <p className="mt-8 text-center text-sm text-text-muted">
        <Link href="/" className="text-brass hover:text-brass-hover">
          ← Back to site
        </Link>
      </p>
    </div>
  );
}
