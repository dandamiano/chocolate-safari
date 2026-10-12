import Link from "next/link";
import { CocoaMark } from "@/components/brand/logo";
import { LoginForm } from "@/components/admin/login-form";
import { isSupabaseConfigured } from "@/lib/supabase-env";

export const metadata = {
  title: "Admin sign in",
};

const ERROR_COPY: Record<string, string> = {
  forbidden: "This account doesn’t have admin access.",
  config: "Admin isn’t configured yet.",
  auth: "That sign-in link expired or isn’t valid. Try again.",
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
    <div className="relative flex min-h-full flex-col justify-center px-4 py-12 sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-24 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-brass/[0.07] blur-3xl" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-bg-elevated/80 to-transparent" />
      </div>

      <div className="relative mx-auto w-full max-w-sm">
        <div className="mb-10 flex flex-col items-center text-center">
          <CocoaMark className="mb-4 size-10" />
          <p className="font-display text-2xl tracking-tight text-text-on-dark sm:text-[1.75rem]">
            Chocolate Safari
          </p>
          <h1 className="mt-3 text-sm font-medium tracking-wide text-brass">
            Admin sign in
          </h1>
        </div>

        {errorMessage ? (
          <p
            className="mb-6 rounded-lg border border-red-500/30 bg-red-950/30 px-3.5 py-3 text-center text-sm text-red-200"
            role="alert"
          >
            {errorMessage}
          </p>
        ) : null}

        <LoginForm configured={configured} />

        <p className="mt-10 text-center text-sm text-text-muted">
          <Link
            href="/"
            className="text-text-muted transition-colors hover:text-brass"
          >
            ← Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}
