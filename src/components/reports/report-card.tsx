import Image from "next/image";
import { Card } from "@/components/ui";
import type { ReportView } from "@/lib/mysql/types";
import { ClaimRequestButton } from "@/components/reports/claim-request-button";
import { ReportStatusControl } from "@/components/reports/report-status-control";
import { ReportSightingButton } from "@/components/reports/report-sighting-button";
import { FoundResponseButton } from "@/components/reports/found-response-button";

export function ReportCard({ report, canClaim = false, own = false }: { report: ReportView; canClaim?: boolean; own?: boolean }) {
  return (
    <Card className="overflow-hidden">
      {report.hasImage && <Image src={`/api/reports/${report.id}/image`} alt={`Photo of ${report.itemName}`} width={960} height={640} unoptimized className="max-h-80 w-full object-cover" />}
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${report.type === "lost" ? "bg-warning/10 text-warning" : "bg-success/10 text-success"}`}>{report.type === "lost" ? "Lost item" : "Found item"}</span>
            <span className="rounded-full bg-elevated px-3 py-1 text-xs capitalize text-muted">{report.status}</span>
          </div>
          <time className="text-xs text-subtle" dateTime={report.createdAt}>{new Date(report.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</time>
        </div>
        <h3 className="mt-4 text-lg font-bold">{report.itemName}</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted">{report.description || "No general description provided."}</p>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-subtle">
          {report.location && <span>Location: {report.location}</span>}
          {report.occurredAt && <span>Reported time: {new Date(report.occurredAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>}
        </div>
        {(canClaim || own) && <div className="mt-5 border-t border-border pt-4">{own ? <ReportStatusControl reportId={report.id} status={report.status} /> : canClaim && report.status === "open" ? report.type === "lost" ? <div className="flex flex-wrap items-center gap-3"><FoundResponseButton reportId={report.id} /><ReportSightingButton reportId={report.id} /></div> : <ClaimRequestButton reportId={report.id} /> : null}</div>}
      </div>
    </Card>
  );
}
