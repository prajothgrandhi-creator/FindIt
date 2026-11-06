import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, ShieldCheck } from "lucide-react";
import { signOutAction } from "@/app/actions/auth";
import { getCurrentStudentSession } from "@/lib/auth/session";
import { Card, PageHeader } from "@/components/ui";

export const instant = false;

export default async function PendingVerificationPage() {
  const current = await getCurrentStudentSession();
  if (!current) redirect("/login");
  if (current.profile.verificationStatus === "verified") {
    redirect(current.profile.role === "admin" ? "/admin" : "/dashboard");
  }

  return (
    <div className="shell py-12 sm:py-16">
      <PageHeader eyebrow="CAMPUS APPROVAL PENDING" first="Campus access" second="needs approval." description="Your account is signed in, but student features remain unavailable until an authorized campus approval process is complete." />
      <Card className="max-w-2xl p-6 sm:p-8">
        <span className="grid size-11 place-items-center rounded-xl bg-warning/10 text-warning"><ShieldCheck size={21} aria-hidden="true" /></span>
        <h2 className="mt-4 font-semibold">Your account is waiting for campus approval</h2>
        <p className="mt-2 text-sm leading-6 text-muted">Email confirmation is not required. Student-only areas stay locked while your profile is pending; an authorized campus process must approve enrollment before access is enabled.</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link href="/help" className="focus-ring inline-flex min-h-11 items-center rounded-lg border border-border px-4 text-sm font-semibold text-text hover:bg-elevated/50">Get help</Link>
          <form action={signOutAction}><button className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-muted hover:text-text"><LogOut size={16} aria-hidden="true" />Sign out</button></form>
        </div>
      </Card>
    </div>
  );
}
