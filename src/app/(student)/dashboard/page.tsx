import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { getCurrentStudentSession } from "@/lib/auth/session";
import { getDashboardSnapshot } from "@/lib/mysql/dashboard";
import { redirect } from "next/navigation";

// This route is behind request-time authentication and is allowed to redirect while guarding access.
export const instant = false;

export default async function DashboardPage() {
  const current = await getCurrentStudentSession();
  if (!current) redirect("/login");
  let data: Awaited<ReturnType<typeof getDashboardSnapshot>> | undefined;
  try { data = await getDashboardSnapshot(current.profile._id); } catch { /* Dashboard still renders with a clear MySQL unavailable state. */ }
  return <DashboardContent displayName={current.profile.displayName} data={data} dataUnavailable={!data} />;
}
