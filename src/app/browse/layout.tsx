import type { ReactNode } from "react";
import type { Metadata } from "next";
import { StudentShell } from "@/components/layout/student-shell";
import { getCurrentStudentSession } from "@/lib/auth/session";
import { unreadNotificationCount } from "@/lib/mysql/notifications";

export const metadata: Metadata = {
  title: "Browse Items | FindIt",
  description: "Browse lost and found reports from the PES University campus community.",
};

export default async function BrowseLayout({ children }: { children: ReactNode }) {
  let current: Awaited<ReturnType<typeof getCurrentStudentSession>> = null;
  try { current = await getCurrentStudentSession(); } catch { /* Public browsing remains available if session storage is unavailable. */ }
  if (!current) return <StudentShell mode="guest">{children}</StudentShell>;
  let unreadNotifications = 0;
  try { unreadNotifications = await unreadNotificationCount(current.profile._id); } catch { /* Browse stays available if notification counts are unavailable. */ }
  return <StudentShell displayName={current.profile.displayName} srn={current.profile.normalizedSrn} unreadNotifications={unreadNotifications}>{children}</StudentShell>;
}
