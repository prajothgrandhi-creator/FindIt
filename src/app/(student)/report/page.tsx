import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { ReportForm } from "@/components/reports/report-form";
import { getReport } from "@/lib/mysql/reports";

export const instant = false;

export default async function ReportPage({ searchParams }: { searchParams: Promise<{ type?: string; relatedLostId?: string }> }) {
  const params = await searchParams;
  let relatedLostId: string | undefined;
  let relatedLostItem: string | undefined;
  if (params.type === "found" && params.relatedLostId) {
    try {
      const source = await getReport(params.relatedLostId);
      if (source?.type === "lost" && source.status === "open") { relatedLostId = source.id; relatedLostItem = source.itemName; }
    } catch { /* The report form remains available without a related item. */ }
  }
  const selectedType = params.type === "lost" || params.type === "found" ? params.type : "";
  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/browse" className="focus-ring mb-6 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-muted hover:text-text"><ArrowLeft size={16} aria-hidden="true" />Back to Browse Items</Link>
      <PageHeader eyebrow="CAMPUS LOST & FOUND" first="Report an" second="Item." description="Share the basics so the campus community can help reconnect belongings with their owners." />
      <ReportForm key={`${selectedType || "default"}-${relatedLostId ?? ""}`} initialType={selectedType} relatedLostId={relatedLostId} relatedLostItem={relatedLostItem} />
    </div>
  );
}
