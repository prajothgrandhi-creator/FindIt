import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { StudentShell } from "@/components/layout/student-shell";
import { getCurrentStudentSession } from "@/lib/auth/session";
import { unreadNotificationCount } from "@/lib/mysql/notifications";

export const instant = false;

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const current = await getCurrentStudentSession();
  if (!current) redirect("/login");
  const { profile } = current;
  if (profile.role === "admin") redirect("/admin");
  let unreadNotifications = 0;
  try { unreadNotifications = await unreadNotificationCount(profile._id); } catch { unreadNotifications = 0; }

  return <StudentShell displayName={profile.displayName} srn={profile.normalizedSrn} unreadNotifications={unreadNotifications}>{children}</StudentShell>;
}
