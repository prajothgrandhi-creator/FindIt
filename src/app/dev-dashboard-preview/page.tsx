import { notFound } from "next/navigation";
import { StudentShell } from "@/components/layout/student-shell";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export const instant = false;

export default function DashboardPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  return (
    <>
      <p role="status" className="border-b border-warning/30 bg-warning/10 px-4 py-3 text-center text-xs font-semibold text-warning">
        DEVELOPMENT-ONLY DESIGN PREVIEW — not signed in; no student data is loaded.
      </p>
      <StudentShell displayName="Design preview" srn="No student account" mode="preview">
        <DashboardContent preview />
      </StudentShell>
    </>
  );
}
