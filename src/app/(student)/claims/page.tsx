import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Card, PageHeader } from "@/components/ui";
import { ClaimDecision } from "@/components/reports/claim-decision";
import { getCurrentStudentSession } from "@/lib/auth/session";
import { listClaimsForUser } from "@/lib/mysql/claims";

export const instant = false;

export default async function ClaimsPage() {
  const current = await getCurrentStudentSession();
  if (!current) redirect("/login");
  let claims: Awaited<ReturnType<typeof listClaimsForUser>> = [];
  let unavailable = false;
  try { claims = await listClaimsForUser(current.profile._id); } catch { unavailable = true; }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader eyebrow="ITEM CLAIMS" first="A careful way" second="to reconnect." description="Claims stay private between the report owner and the person responding." />
      {unavailable ? <Card className="mt-6 p-6 text-sm text-danger" role="alert">Claims are temporarily unavailable. Check the MySQL connection and try again.</Card>
        : claims.length === 0 ? <Card className="mt-6 p-6 sm:p-8"><span className="grid size-11 place-items-center rounded-xl bg-accent/10 text-accent-bright"><ShieldCheck size={20} aria-hidden="true" /></span><h2 className="mt-4 text-lg font-bold">No claims yet</h2><p className="mt-2 text-sm leading-6 text-muted">Claims you send or receive about your reports will appear here.</p><Link href="/browse" className="landing-action landing-action-primary focus-ring mt-5">Browse reports <ArrowRight size={16} aria-hidden="true" /></Link></Card>
        : <div className="mt-6 grid gap-4 md:grid-cols-2">{claims.map((claim) => {
          const isOwner = claim.report_owner_id === current.profile._id;
          return <Card key={claim.id} className="p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="eyebrow">{isOwner ? "CLAIM RECEIVED" : "CLAIM SENT"}</p><h2 className="mt-2 text-lg font-bold">{claim.item_name}</h2></div><span className="rounded-full bg-elevated px-3 py-1 text-xs capitalize text-muted">{claim.status}</span></div><p className="mt-2 text-sm text-subtle">{claim.report_type === "lost" ? "Lost report" : "Found report"} · {new Date(claim.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p><p className="mt-4 text-sm font-semibold">{isOwner ? `From ${claim.claimant_name}` : "Your private message"}</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-muted">{claim.message}</p>{isOwner && claim.status === "pending" && <ClaimDecision claimId={claim.id} />}</Card>;
        })}</div>}
    </div>
  );
}
