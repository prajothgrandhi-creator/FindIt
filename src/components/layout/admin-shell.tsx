import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

export function AdminShell({ children }: { children: ReactNode }) { return <div className="min-h-screen bg-[#15121c]"><header className="flex h-[68px] items-center justify-between border-b border-white/[.07] px-6 sm:px-10"><Link href="/" className="text-lg font-bold">Find<span className="text-accent-bright">It</span></Link><span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.04] px-3 py-1.5 text-xs text-[#b7aebf]"><ShieldCheck size={14} className="text-accent-bright" /> Admin workspace</span></header><main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">{children}</main></div>; }
