import Link from "next/link";
import { Search } from "lucide-react";
import { Button, Card, Input, PageHeader, Select } from "@/components/ui";
import { ReportCard } from "@/components/reports/report-card";
import { getCurrentStudentSession } from "@/lib/auth/session";
import { listReports } from "@/lib/mysql/reports";
import type { ReportType } from "@/lib/mysql/types";

type BrowseSearchParams = { q?: string; type?: string };
export const instant = false;

export default async function BrowseItemsPage({ searchParams }: { searchParams: Promise<BrowseSearchParams> }) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const type: ReportType | undefined = params.type === "lost" || params.type === "found" ? params.type : undefined;
  const clearSearchHref = type ? `/browse?type=${type}` : "/browse";
  const hasFilters = Boolean(query) || Boolean(type);
  let reports = [] as Awaited<ReturnType<typeof listReports>>;
  let unavailable = false;
  let current = null as Awaited<ReturnType<typeof getCurrentStudentSession>>;
  try {
    [reports, current] = await Promise.all([
      listReports({ query, type, status: "open", limit: 50 }),
      getCurrentStudentSession(),
    ]);
  } catch {
    unavailable = true;
    try { current = await getCurrentStudentSession(); } catch { current = null; }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader eyebrow="CAMPUS REPORTS" first="Browse" second="Items." description="Search current lost and found reports shared by the campus community." />
      <section aria-labelledby="browse-search-title">
        <h2 id="browse-search-title" className="mb-3 text-lg font-bold">Search campus items</h2>
        <form action="/browse" method="get" role="search" className="surface-card grid gap-3 p-4 sm:p-5 md:grid-cols-[minmax(0,1fr)_190px_auto] md:items-end">
          <div><label htmlFor="browse-query" className="mb-2 block text-sm font-semibold">Item, description, or location</label><div className="relative"><Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" /><Input id="browse-query" type="search" name="q" defaultValue={query} placeholder="Search items or places" className="pl-10" /></div></div>
          <div><label htmlFor="browse-type" className="mb-2 block text-sm font-semibold">Report type</label><Select id="browse-type" name="type" defaultValue={type ?? "all"}><option value="all">All items</option><option value="lost">Lost</option><option value="found">Found</option></Select></div>
          <Button type="submit" className="w-full md:w-auto"><Search size={16} aria-hidden="true" />Search items</Button>
        </form>
      </section>
      <section aria-labelledby="browse-results-title" className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><div><h2 id="browse-results-title" className="text-lg font-bold">Browse results</h2>{hasFilters && <p className="mt-1 text-sm text-muted">Filtered by {type ?? "all report types"}{query ? ` · “${query}”` : ""}</p>}</div>{hasFilters && <div className="flex items-center gap-4 text-sm">{query && <Link href={clearSearchHref} className="focus-ring rounded text-muted hover:text-text">Clear search</Link>}<Link href="/browse" className="focus-ring rounded font-semibold text-accent-bright hover:text-accent">Clear filters</Link></div>}</div>
        {unavailable ? <Card className="p-6 text-sm text-danger" role="alert">Report search is temporarily unavailable. Check that the MySQL connection is configured and try again.</Card>
          : reports.length === 0 ? <Card className="flex min-h-56 flex-col items-center justify-center p-8 text-center"><span className="mb-4 grid size-12 place-items-center rounded-full bg-elevated text-accent-bright"><Search size={20} aria-hidden="true" /></span><h3 className="font-semibold">{hasFilters ? "No open reports match this search" : "No open reports yet"}</h3><p className="mt-2 max-w-xl text-sm leading-6 text-muted">When campus members publish a lost or found report, it will appear here.</p><Link href="/report" className="landing-action landing-action-primary focus-ring mt-5">Create a report</Link></Card>
          : <div className="grid gap-4 md:grid-cols-2">{reports.map((report) => <ReportCard key={report.id} report={report} canClaim={Boolean(current) && report.ownerId !== current?.profile._id} />)}</div>}
      </section>
    </div>
  );
}
