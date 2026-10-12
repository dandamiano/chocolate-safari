import { AdminShell } from "@/components/admin/admin-shell";
import { ChocolateForm } from "@/components/admin/chocolate-form";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata = {
  title: "New chocolate · Admin",
};

export default async function AdminNewChocolatePage() {
  const user = await requireAdmin();

  return (
    <AdminShell email={user.email}>
      <h1 className="mb-6 font-display text-3xl">New chocolate</h1>
      <ChocolateForm mode="create" />
    </AdminShell>
  );
}
