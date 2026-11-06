import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Link2 } from "lucide-react";
import { Card, PageHeader } from "@/components/ui";
import { ReportCard } from "@/components/reports/report-card";
import { getCurrentStudentSession } from "@/lib/auth/session";
import { listLostReportIdsRespondedToByFinder, listReports } from "@/lib/mysql/reports";
import type { ReportView } from "@/lib/mysql/types";

export const instant = false;

const ignoredTerms = new Set(["the", "and", "for", "with", "from", "this", "that", "have", "has", "near", "item", "lost", "found"]);
function terms(value: string) {
  return new Set(value.toLowerCase().match(/[a-z0-9]{3,}/g)?.filter((term) => !ignoredTerms.has(term)) ?? []);
}
function overlap(left: Set<string>, right: Set<string>) {
  let count = 0;
  for (const term of left) if (right.has(term)) count += 1;
  return count;
}

export default async function MatchesPage() {
  const current = await getCurrentStudentSession();
  if (!current) redirect("/login");
  let ownReports: ReportView[] = [];
  let candidates: ReportView[] = [];
  let respondedLostReportIds: string[] = [];
  let unavailable = false;
  try {
    [ownReports, candidates, respondedLostReportIds] = await Promise.all([
      listReports({ ownerId: current.profile._id, status: "open", limit: 50 }),
      listReports({ excludeOwnerId: current.profile._id, status: "open", limit: 100 }),
      listLostReportIdsRespondedToByFinder(current.profile._id),
    ]);
  } catch { unavailable = true; }
  const respondedLostReports = new Set(respondedLostReportIds);

  const matches = unavailable ? [] : ownReports.flatMap((mine) => candidates
    .filter((candidate) => candidate.type !== mine.type)
    .map((candidate) => {
      const left = terms(`${mine.itemName} ${mine.description} ${mine.location}`);
      const right = terms(`${candidate.itemName} ${candidate.description} ${candidate.location}`);
      const shared = overlap(left, right);
      const itemNameMatch = overlap(terms(mine.itemName), terms(candidate.itemName)) >= 1;
      const alreadyResponded = mine.type === "found" && candidate.type === "lost" && respondedLostReports.has(candidate.id);
      return { mine, candidate, shared, itemNameMatch, alreadyResponded };
    })
    .filter((match) => match.shared >= 2 || match.itemNameMatch))
    .sort((a, b) => b.shared - a.shared)
    .slice(0, 30);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader eyebrow="ITEM RECOVERY" first="Potential" second="matches." description="Find open reports of the opposite type that share item, description, or location terms with your reports." />
      {unavailable ? <Card className="mt-6 p-6 text-sm text-danger" role="alert">Matching is temporarily unavailable. Check the MySQL connection and try again.</Card>
        : matches.length === 0 ? <Card className="mt-6 p-6 sm:p-8"><div className="flex items-start gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent-bright"><Link2 size={20} aria-hidden="true" /></span><div><h2 className="text-lg font-bold">{ownReports.length === 0 ? "Add a report to see potential matches" : "No potential matches right now"}</h2><p className="mt-2 text-sm leading-6 text-muted">{ownReports.length === 0 ? "Matches compare your open lost and found reports with other students’ open reports." : "We compare item names, descriptions, and locations across open lost and found reports. New reports can create matches later."}</p><Link href="/my-reports" className="focus-ring mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold text-muted hover:bg-elevated/50">Open my reports <ArrowRight size={16} aria-hidden="true" /></Link></div></div></Card>
        : <div className="mt-6 space-y-6">{matches.map(({ mine, candidate, shared, itemNameMatch, alreadyResponded }) => <section key={`${mine.id}-${candidate.id}`} className="space-y-3"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted">Possible match for your <span className="font-semibold text-text">{mine.itemName}</span></p><span className="rounded-full bg-elevated px-3 py-1 text-xs text-muted">{itemNameMatch ? "Item name match" : `${shared} shared details`}</span></div>{alreadyResponded && <p className="text-sm text-success">Your found report is already linked to this lost report.</p>}<ReportCard report={candidate} canClaim={!alreadyResponded} /></section>)}</div>}
    </div>
  );
}
