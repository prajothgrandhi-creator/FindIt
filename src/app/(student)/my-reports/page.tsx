import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, ClipboardList } from "lucide-react";
import { Card, PageHeader } from "@/components/ui";
import { ReportCard } from "@/components/reports/report-card";
import { getCurrentStudentSession } from "@/lib/auth/session";
import { listFoundResponsesForReportOwners, listReports, listSightingsForReportOwners } from "@/lib/mysql/reports";

export const instant = false;

export default async function MyReportsPage({ searchParams }: { searchParams: Promise<{ created?: string }> }) {
  const current = await getCurrentStudentSession();
  if (!current) redirect("/login");
  const params = await searchParams;
  let reports = [] as Awaited<ReturnType<typeof listReports>>;
  let sightings: Awaited<ReturnType<typeof listSightingsForReportOwners>> = [];
  let foundResponses: Awaited<ReturnType<typeof listFoundResponsesForReportOwners>> = [];
  let unavailable = false;
  try { [reports, sightings, foundResponses] = await Promise.all([listReports({ ownerId: current.profile._id, limit: 100 }), listSightingsForReportOwners(current.profile._id), listFoundResponsesForReportOwners(current.profile._id)]); } catch { unavailable = true; }
  const sightingsByReport = new Map<string, typeof sightings>();
  for (const sighting of sightings) sightingsByReport.set(sighting.report_id, [...(sightingsByReport.get(sighting.report_id) ?? []), sighting]);
  const foundResponsesByReport = new Map<string, typeof foundResponses>();
  for (const response of foundResponses) foundResponsesByReport.set(response.lostReportId, [...(foundResponsesByReport.get(response.lostReportId) ?? []), response]);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader eyebrow="YOUR ACTIVITY" first="Reports you’ve" second="shared." description="Review your live lost and found reports and update their status." />
      {params.created === "1" && <p role="status" className="mt-5 rounded-lg border border-success/25 bg-success/10 p-4 text-sm text-success">Your report was published.</p>}
      {unavailable ? <Card className="mt-6 p-6 text-sm text-danger" role="alert">Your reports are temporarily unavailable. Check that the MySQL connection is configured and try again.</Card>
        : reports.length === 0 ? <Card className="mt-6 p-6 sm:p-8"><div className="flex items-start gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent-bright"><ClipboardList size={20} aria-hidden="true" /></span><div><h2 className="text-lg font-bold">You haven’t shared a report yet</h2><p className="mt-2 text-sm leading-6 text-muted">Reports you create will be linked to your FindIt profile and appear here.</p><Link href="/report" className="landing-action landing-action-primary focus-ring mt-5">Report an item <ArrowRight size={16} aria-hidden="true" /></Link></div></div></Card>
        : <div className="mt-6 grid gap-4 md:grid-cols-2">{reports.map((report) => <div key={report.id} className="space-y-3"><ReportCard report={report} own />{(foundResponsesByReport.get(report.id) ?? []).map((response) => <Card key={response.report.id} className="p-4"><p className="eyebrow">FOUND ITEM RESPONSE</p><p className="mt-1 text-xs text-muted">A student reported this item in response to your lost report.</p><div className="mt-3"><ReportCard report={response.report} canClaim /></div></Card>)}{(sightingsByReport.get(report.id) ?? []).map((sighting) => <Card key={sighting.id} className="p-4"><p className="eyebrow">SIGHTING UPDATE</p><p className="mt-2 text-sm leading-6 text-muted">{sighting.description || "A campus member reported seeing something related to this item."}</p><div className="mt-2 flex flex-wrap gap-4 text-xs text-subtle">{sighting.location && <span>Location: {sighting.location}</span>}{sighting.occurred_at && <span>Seen: {new Date(sighting.occurred_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>}</div></Card>)}</div>)}</div>}
    </div>
  );
}
