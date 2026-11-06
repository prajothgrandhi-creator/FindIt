import type { ReactNode } from "react";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { getRosterAdminContext } from "@/lib/auth/roster-admin";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="shell py-12 text-muted" role="status">Checking administrator access…</div>}>
      <AuthorizedAdminLayout>{children}</AuthorizedAdminLayout>
    </Suspense>
  );
}

async function AuthorizedAdminLayout({ children }: { children: ReactNode }) {
  const access = await getRosterAdminContext();
  if (access.kind === "unauthenticated") redirect("/login");
  if (access.kind !== "authorized") redirect("/forbidden");

  return <AdminShell>{children}</AdminShell>;
}
