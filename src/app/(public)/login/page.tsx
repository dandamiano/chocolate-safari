import Link from "next/link";
import { CocoaMark } from "@/components/brand/logo";
import { PublicAuthForm } from "@/components/auth/public-auth-form";
import { getPublicSession } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase-env";
import { redirect } from "next/navigation";

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next =
    params.next?.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : "/tasting-log";

  const session = await getPublicSession();
  if (session.user) {
    redirect(next);
  }

  return (
    <main className="relative flex min-h-[70vh] flex-col justify-center px-4 py-12 sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-24 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-brass/[0.07] blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-sm">
        <div className="mb-10 flex flex-col items-center text-center">
          <CocoaMark className="mb-4 size-10" />
          <p className="font-display text-2xl tracking-tight text-text-on-dark">
            Chocolate Safari
          </p>
          <h1 className="mt-3 text-sm font-medium tracking-wide text-brass">
            Sign in
          </h1>
          <p className="mt-2 max-w-xs text-sm text-text-muted">
            Save bars to your tasting log and leave community reviews.
          </p>
        </div>

        <PublicAuthForm
          mode="login"
          next={next}
          configured={isSupabaseConfigured()}
        />

        <p className="mt-10 text-center text-sm text-text-muted">
          <Link href="/" className="transition-colors hover:text-brass">
            ← Back to site
          </Link>
        </p>
      </div>
    </main>
  );
}
