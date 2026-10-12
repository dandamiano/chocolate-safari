import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { ChocolateForm } from "@/components/admin/chocolate-form";
import { requireAdmin } from "@/lib/admin/auth";
import { getAdminChocolate } from "@/lib/admin/content";

export const metadata = {
  title: "Edit chocolate · Admin",
};

export default async function AdminEditChocolatePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const user = await requireAdmin();
  const { slug } = await params;
  const { saved } = await searchParams;
  const chocolate = await getAdminChocolate(slug);
  if (!chocolate) notFound();

  return (
    <AdminShell email={user.email}>
      <h1 className="font-display text-3xl">Edit · {chocolate.title}</h1>
      {saved ? (
        <p className="mt-2 text-sm text-brass" role="status">
          Saved.
        </p>
      ) : null}
      <div className="mt-6">
        <ChocolateForm mode="edit" chocolate={chocolate} />
      </div>
    </AdminShell>
  );
}
