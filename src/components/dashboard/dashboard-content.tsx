import Link from "next/link";
import { Activity, ArrowRight, Bell, ClipboardList, FilePlus2, Link2, Search, ShieldCheck } from "lucide-react";
import { Card, PageHeader } from "@/components/ui";
import { ReportCard } from "@/components/reports/report-card";
import type { ReportView } from "@/lib/mysql/types";

type DashboardData = {
  reports: { total: number; open: number; resolved: number };
  recentReports: ReportView[];
  unreadNotifications: number;
  pendingClaims: number;
  recentNotifications: Array<{ id: string; title: string; body: string; href: string; created_at: Date | string; read_at: Date | string | null }>;
};

export function DashboardContent({
  preview = false,
  displayName,
  data,
  dataUnavailable = false,
}: {
  preview?: boolean;
  displayName?: string;
  data?: DashboardData;
  dataUnavailable?: boolean;
}) {
  const shortcuts = [
    { href: "/my-reports", label: "My reports", icon: ClipboardList, value: data ? String(data.reports.total) : "—", detail: "reports" },
    { href: "/matches", label: "Potential matches", icon: Link2, value: "Live", detail: "search" },
    { href: "/claims", label: "My claims", icon: ShieldCheck, value: data ? String(data.pendingClaims) : "—", detail: "awaiting response" },
    { href: "/notifications", label: "Unread updates", icon: Bell, value: data ? String(data.unreadNotifications) : "—", detail: "new" },
  ];

  return (
    <div className="mx-auto max-w-[1440px]">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,.9fr)]">
        <div className="min-w-0">
          <PageHeader eyebrow="STUDENT DASHBOARD" first="Welcome back" second="to FindIt." description={displayName ? `Your account, reports, and activity are connected to ${displayName}.` : "Your campus recovery hub. Report, search, and get your belongings back."} />
          {!preview && dataUnavailable && <p role="alert" className="mb-5 rounded-lg border border-danger/25 bg-danger/10 p-4 text-sm text-danger">Lost and found data is temporarily unavailable. Check the MySQL connection settings.</p>}
          <section aria-label="Your FindIt shortcuts" className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
            {shortcuts.map(({ href, label, icon: Icon, value, detail }) => <Link key={href} href={href} className="focus-ring rounded-xl"><Card className="flex min-h-28 items-center gap-3 p-4 transition hover:border-accent/40"><span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent-bright"><Icon size={19} aria-hidden="true" /></span><span className="min-w-0"><span className="block text-sm font-semibold leading-5">{label}</span><span className="mt-1 block text-xs text-subtle">{preview ? "Preview" : dataUnavailable ? "Unavailable" : `${value} ${detail}`}</span></span></Card></Link>)}
          </section>
          <Card className="relative mb-6 overflow-hidden border-accent/20 bg-gradient-to-br from-surface via-surface to-elevated p-6 sm:p-8"><div className="relative z-10 max-w-xl"><p className="eyebrow">GET STARTED</p><h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Lost something or <span className="text-accent-bright">found an item?</span></h2><p className="mt-3 max-w-lg text-sm leading-6 text-muted">Create a report to share it with the campus community. Your report is saved to MySQL and linked to your FindIt profile.</p><div className="mt-5 flex flex-wrap gap-3"><Link href="/report?type=lost" className="landing-action landing-action-primary focus-ring"><FilePlus2 size={17} aria-hidden="true" />Report Lost Item</Link><Link href="/report?type=found" className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-accent px-4 text-sm font-semibold text-text transition hover:bg-accent/10"><Search size={17} aria-hidden="true" />Report Found Item</Link></div></div><div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -right-10 hidden size-64 rounded-full border border-accent/15 sm:block"><div className="absolute inset-8 rounded-full border border-accent/10" /><div className="absolute inset-[4.5rem] grid place-items-center rounded-[2rem] border border-accent/20 bg-elevated/80 text-accent-bright"><FilePlus2 size={56} strokeWidth={1.2} /></div></div></Card>
          <section aria-labelledby="recent-reports-title"><div className="mb-3 flex items-center justify-between gap-4"><h2 id="recent-reports-title" className="text-lg font-bold">Recent Reports</h2><Link href="/my-reports" className="focus-ring inline-flex items-center gap-1 rounded text-sm font-semibold text-accent-bright">View all <ArrowRight size={15} aria-hidden="true" /></Link></div>{preview ? <Card className="p-6 text-sm text-muted">Preview only. No live report data is loaded.</Card> : dataUnavailable ? <Card className="p-6 text-sm text-danger" role="alert">Recent reports could not be loaded.</Card> : data?.recentReports.length ? <div className="grid gap-4 md:grid-cols-2">{data.recentReports.slice(0, 2).map((report) => <ReportCard key={report.id} report={report} own />)}</div> : <Card className="p-6"><p className="font-semibold">No reports yet</p><p className="mt-2 text-sm leading-6 text-muted">Reports you publish will appear here.</p></Card>}</section>
        </div>
        <aside className="space-y-5">
          <section aria-labelledby="recent-activity-title"><Card className="p-5 sm:p-6"><h2 id="recent-activity-title" className="flex items-center gap-2 text-lg font-bold"><Activity size={19} className="text-accent-bright" aria-hidden="true" />Recent Activity</h2>{preview ? <p className="mt-4 text-sm text-muted">Preview only. No live activity is loaded.</p> : dataUnavailable ? <p className="mt-4 text-sm text-danger" role="alert">Activity is temporarily unavailable.</p> : data?.recentNotifications.length ? <ul className="mt-4 space-y-4">{data.recentNotifications.slice(0, 4).map((notification) => <li key={notification.id} className="border-b border-border pb-3 last:border-0"><Link href={notification.href} className="focus-ring rounded"><span className="block text-sm font-semibold">{notification.title}</span><span className="mt-1 block text-xs leading-5 text-muted">{notification.body}</span></Link></li>)}</ul> : <p className="mt-4 text-sm text-muted">No recent updates.</p>}<Link href="/notifications" className="focus-ring mt-5 inline-flex items-center gap-1 rounded text-sm font-semibold text-accent-bright">Open notifications <ArrowRight size={15} aria-hidden="true" /></Link></Card></section>
          <Card className="border-accent/15 bg-gradient-to-br from-surface to-elevated p-5 sm:p-6"><h2 className="flex items-center gap-2 text-lg font-bold"><ShieldCheck size={19} className="text-accent-bright" aria-hidden="true" />Recovery Tip</h2><p className="mt-4 text-sm leading-6 text-muted">Keep unique identifying details private and confirm ownership before handing an item over.</p><Link href="/safety" className="focus-ring mt-4 inline-flex items-center gap-1 rounded text-sm font-semibold text-accent-bright">Read safety guidance <ArrowRight size={15} aria-hidden="true" /></Link></Card>
        </aside>
      </div>
      <p className="mt-8 border-t border-border pt-5 text-sm leading-6 text-subtle">{preview ? "Development preview only. No student identity or live account data is loaded." : "Your reports and activity are scoped to your authenticated FindIt profile."}</p>
    </div>
  );
}
