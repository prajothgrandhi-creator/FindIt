"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, CircleHelp, ClipboardList, Compass, House, LogOut, Menu, Plus, Search, Settings, Sparkles, X } from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { signOutAction } from "@/app/actions/auth";

type StudentShellMode = "student" | "preview" | "guest";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: House },
  { href: "/browse", label: "Browse items", icon: Compass },
  { href: "/report", label: "Report an item", icon: Plus },
  { href: "/my-reports", label: "My reports", icon: ClipboardList },
  { href: "/matches", label: "Matches", icon: Sparkles },
  { href: "/claims", label: "My claims", icon: ClipboardList },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/safety", label: "Help & safety", icon: CircleHelp },
];

function getInitials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

export function StudentShell({ children, displayName, srn, unreadNotifications = 0, mode = "student" }: { children: ReactNode; displayName?: string; srn?: string; unreadNotifications?: number; mode?: StudentShellMode }) {
  const pathname = usePathname();
  const router = useRouter();
  const identityName = mode === "preview" ? "Design preview" : mode === "guest" ? "Guest" : displayName?.trim() || "Student";
  const identityDetail = mode === "preview" ? "No student account" : mode === "guest" ? "Browse campus reports" : srn;
  const initials = mode === "preview" ? "DP" : mode === "guest" ? "G" : getInitials(identityName) || "S";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (mode !== "student") return;
    const timer = window.setInterval(() => router.refresh(), 30_000);
    return () => window.clearInterval(timer);
  }, [mode, router]);

  function preserveBrowseType(event: FormEvent<HTMLFormElement>) {
    const typeField = event.currentTarget.querySelector<HTMLInputElement>('input[name="type"]');
    if (!typeField) return;
    const currentType = new URLSearchParams(window.location.search).get("type");
    typeField.value = currentType === "lost" || currentType === "found" ? currentType : "all";
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-[250px] flex-col border-r border-border bg-background px-5 py-6 lg:flex">
        <Link href="/dashboard" className="mb-10 flex items-center gap-2.5 rounded-md">
          <span className="grid size-9 place-items-center rounded-lg bg-accent text-sm font-black text-background">F</span>
          <span><span className="block text-lg font-bold">Find<span className="text-accent-bright">It</span></span><span className="block text-xs text-subtle">Campus Lost &amp; Found</span></span>
        </Link>
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-subtle">Workspace</p>
        <nav className="flex flex-col gap-1" aria-label="Student workspace">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
            return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`focus-ring flex min-h-11 items-center gap-3 rounded-lg border-l-2 px-3 text-sm transition ${active ? "border-accent bg-accent/10 font-semibold text-text" : "border-transparent text-muted hover:bg-elevated/50 hover:text-text"}`}>
              <Icon size={17} strokeWidth={1.8} aria-hidden="true" />{label}
            </Link>;
          })}
        </nav>
        {mode === "student" ? <form action={signOutAction} className="mt-auto border-t border-border pt-4">
          <button className="focus-ring flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm text-muted transition hover:bg-elevated/50 hover:text-text"><LogOut size={17} aria-hidden="true" />Sign out</button>
        </form> : <Link href="/login" className="focus-ring mt-auto flex min-h-11 items-center gap-3 border-t border-border px-3 pt-4 text-sm text-muted hover:text-text"><LogOut size={17} aria-hidden="true" />Sign in</Link>}
      </aside>

      <div className="lg:pl-[250px]">
        <div className="relative z-30">
        <header className="relative z-30 flex min-h-[72px] items-center gap-2 border-b border-border px-3 sm:gap-4 sm:px-8">
          <Link href="/dashboard" className="shrink-0 rounded-md text-lg font-bold lg:hidden">Find<span className="text-accent-bright">It</span></Link>
          <button type="button" aria-label={mobileMenuOpen ? "Close student navigation" : "Open student navigation"} aria-expanded={mobileMenuOpen} aria-controls={mobileMenuOpen ? "student-mobile-menu" : undefined} onClick={() => setMobileMenuOpen((open) => !open)} className="focus-ring grid size-10 shrink-0 place-items-center rounded-lg border border-border text-muted hover:bg-elevated/50 hover:text-text lg:hidden">{mobileMenuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}</button>
          <form action="/browse" method="get" role="search" onSubmit={preserveBrowseType} className="relative min-w-0 flex-1 lg:max-w-2xl">
            <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input name="q" aria-label="Search campus items" placeholder="Search items, locations, or keywords" className="focus-ring h-11 w-full rounded-full border border-border bg-surface pl-10 pr-4 text-sm text-text placeholder:text-subtle" />
            <input type="hidden" name="type" value="all" />
          </form>
          <Link href="/notifications" aria-label={unreadNotifications > 0 ? `Notifications, ${unreadNotifications} unread` : "Notifications"} className="focus-ring relative grid size-10 shrink-0 place-items-center rounded-full text-muted hover:bg-elevated/50 hover:text-text"><Bell size={19} aria-hidden="true" />{unreadNotifications > 0 && <span className="absolute -right-0.5 -top-0.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[9px] font-bold text-background">{unreadNotifications > 9 ? "9+" : unreadNotifications}</span>}</Link>
          {mode === "student" ? <Link href="/settings" aria-label={`Account settings for ${identityName}`} className="focus-ring ml-auto flex shrink-0 items-center gap-3 rounded-full p-1.5 hover:bg-elevated/50">
            <span className="grid size-9 place-items-center rounded-full bg-accent text-sm font-bold text-background">{initials}</span>
            <span className="hidden min-w-0 text-left sm:block"><span className="block max-w-36 truncate text-sm font-semibold text-text">{identityName}</span><span className="block text-xs text-subtle">{identityDetail}</span></span>
          </Link> : <Link href="/login" aria-label="Sign in to FindIt" className="focus-ring ml-auto flex shrink-0 items-center gap-2 rounded-full p-1.5 hover:bg-elevated/50">
            <span className="grid size-9 place-items-center rounded-full bg-accent text-sm font-bold text-background">{initials}</span>
            <span className="hidden min-w-0 text-left sm:block"><span className="block max-w-36 truncate text-sm font-semibold text-text">{identityName}</span><span className="block text-xs text-subtle">{identityDetail}</span></span>
          </Link>}
        </header>

        {mobileMenuOpen && <div id="student-mobile-menu" role="region" aria-label="Student navigation" className="absolute left-3 right-3 top-full z-40 rounded-xl border border-border bg-surface p-3 shadow-xl lg:hidden">
          <nav className="grid gap-1" aria-label="All student pages">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
              return <Link key={href} href={href} aria-current={active ? "page" : undefined} onClick={() => setMobileMenuOpen(false)} className={`focus-ring flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm ${active ? "bg-accent/10 font-semibold text-text" : "text-muted hover:bg-elevated/50 hover:text-text"}`}><Icon size={17} aria-hidden="true" />{label}</Link>;
            })}
            {mode === "student" ? <form action={signOutAction} className="border-t border-border pt-1"><button className="focus-ring flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm text-muted hover:bg-elevated/50 hover:text-text"><LogOut size={17} aria-hidden="true" />Sign out</button></form> : <Link href="/login" className="focus-ring flex min-h-11 items-center gap-3 rounded-lg border-t border-border px-3 pt-1 text-sm text-muted hover:bg-elevated/50 hover:text-text"><LogOut size={17} aria-hidden="true" />Sign in</Link>}
          </nav>
        </div>}
        </div>

        <main className="mx-auto max-w-[1600px] px-4 py-7 pb-24 sm:px-8 sm:py-9 lg:px-10 lg:pb-12">{children}</main>
      </div>

      <nav aria-label="Student tabs" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-border bg-background/95 px-1 py-2 backdrop-blur-lg lg:hidden">
        {navItems.slice(0, 5).map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} aria-label={label} className={`focus-ring flex flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] ${pathname === href ? "text-accent-bright" : "text-muted"}`}>
            <Icon size={18} aria-hidden="true" />{label === "Report an item" ? "Report" : label === "Browse items" ? "Browse" : label === "Dashboard" ? "Home" : label}
          </Link>
        ))}
        {mode === "student" ? <form action={signOutAction} className="grid place-items-center"><button aria-label="Sign out" className="focus-ring flex flex-col items-center gap-1 whitespace-nowrap rounded-lg py-1.5 text-[9px] text-muted"><LogOut size={18} aria-hidden="true" />Sign out</button></form> : <Link href="/login" aria-label="Sign in" className="focus-ring flex flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] text-muted"><LogOut size={18} aria-hidden="true" />Sign in</Link>}
      </nav>
    </div>
  );
}
