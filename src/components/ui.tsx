"use client";

import { useState, type ButtonHTMLAttributes, type HTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, Image as ImageIcon, RotateCcw, X } from "lucide-react";

export function Button({ className = "", variant = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }) {
  const base = "focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-50";
  const styles = { primary: "bg-accent text-[#201708] hover:bg-[#ffbe24]", secondary: "border border-white/10 bg-white/[.04] text-[#f7f4fa] hover:bg-white/[.08]", ghost: "text-[#b7aebf] hover:bg-white/[.06] hover:text-white" };
  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />;
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) { return <input {...props} className={`focus-ring min-h-11 w-full rounded-lg border border-white/10 bg-[#201c28] px-3.5 text-sm text-[#f7f4fa] placeholder:text-[#8e8799] ${props.className ?? ""}`} />; }
export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea {...props} className={`focus-ring min-h-28 w-full rounded-lg border border-white/10 bg-[#201c28] px-3.5 py-3 text-sm text-[#f7f4fa] placeholder:text-[#8e8799] ${props.className ?? ""}`} />; }
export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) { return <select {...props} className={`focus-ring min-h-11 w-full rounded-lg border border-white/10 bg-[#201c28] px-3.5 text-sm text-[#f7f4fa] ${props.className ?? ""}`} />; }
export function Card({ children, className = "", ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) { return <div {...props} className={`surface-card ${className}`}>{children}</div>; }

export function Badge({ children, status = "pending" }: { children: ReactNode; status?: "lost" | "found" | "pending" | "resolved" }) {
  const color = { lost: "border-[#f87171]/25 bg-[#f87171]/10 text-[#fca5a5]", found: "border-[#34d399]/25 bg-[#34d399]/10 text-[#6ee7b7]", pending: "border-[#fbbf24]/25 bg-[#fbbf24]/10 text-[#fcd34d]", resolved: "border-white/10 bg-white/[.06] text-[#b7aebf]" };
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${color[status]}`}>{children}</span>;
}

export function Dialog({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return <div role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"><section role="dialog" aria-modal="true" aria-labelledby="dialog-title" className="surface-card w-full max-w-lg p-6 shadow-2xl"><div className="mb-5 flex items-center justify-between"><h2 id="dialog-title" className="text-lg font-bold">{title}</h2><button aria-label="Close dialog" onClick={onClose} className="focus-ring rounded-md p-2 text-[#b7aebf]"><X size={18} /></button></div>{children}</section></div>;
}

export function Tabs({ tabs, value, onChange }: { tabs: string[]; value: string; onChange: (tab: string) => void }) {
  return <div role="tablist" className="inline-flex rounded-lg border border-white/10 bg-white/[.03] p-1">{tabs.map((tab) => <button key={tab} role="tab" aria-selected={value === tab} onClick={() => onChange(tab)} className={`rounded-md px-4 py-2 text-sm transition ${value === tab ? "bg-[#342c40] text-white" : "text-[#8e8799] hover:text-white"}`}>{tab}</button>)}</div>;
}

export function Skeleton({ className = "" }: { className?: string }) { return <div aria-hidden="true" className={`animate-pulse rounded-lg bg-white/[.06] ${className}`} />; }
export function EmptyState({ title = "Nothing to see here yet", description = "New reports will appear here when they are shared with your campus.", action }: { title?: string; description?: string; action?: ReactNode }) { return <div className="surface-card flex min-h-64 flex-col items-center justify-center p-8 text-center"><span className="mb-4 grid size-12 place-items-center rounded-full bg-white/[.05] text-[#b7aebf]"><ImageIcon size={20} /></span><h3 className="font-semibold">{title}</h3><p className="mt-2 max-w-sm text-sm leading-6 text-[#8e8799]">{description}</p>{action && <div className="mt-5">{action}</div>}</div>; }
export function ErrorState({ retry }: { retry?: () => void }) { return <div role="alert" className="surface-card flex min-h-48 flex-col items-center justify-center p-8 text-center"><h3 className="font-semibold">We couldn’t load this right now</h3><p className="mt-2 text-sm text-[#8e8799]">Please try again in a little while.</p>{retry && <Button variant="secondary" onClick={retry} className="mt-4"><RotateCcw size={15} /> Try again</Button>}</div>; }
export function PageHeader({ eyebrow, first, second, description }: { eyebrow?: string; first: string; second: string; description?: string }) { return <header className="mb-9">{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1 className="page-heading">{first}<span>{second}</span></h1>{description && <p className="max-w-2xl text-base leading-7 text-[#b7aebf]">{description}</p>}</header>; }

export function Toast({ message, onClose }: { message: string; onClose: () => void }) { return <div role="status" className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-xl border border-white/10 bg-[#342c40] px-4 py-3 text-sm shadow-xl"><span>{message}</span><button aria-label="Dismiss notification" onClick={onClose} className="text-[#8e8799] hover:text-white"><X size={15} /></button></div>; }

export function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (page: number) => void }) { return <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-2"><button disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page" className="focus-ring rounded-lg border border-white/10 p-2 disabled:opacity-30"><ChevronLeft size={17} /></button><span className="px-3 text-sm text-[#b7aebf]">Page {page} of {totalPages}</span><button disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Next page" className="focus-ring rounded-lg border border-white/10 p-2 disabled:opacity-30"><ChevronRight size={17} /></button></nav>; }

export function ItemCard({ name, detail, status = "found", color = "", category = "Personal items" }: { name: string; detail: string; status?: "lost" | "found" | "pending" | "resolved"; color?: string; category?: string }) {
  return <article className="surface-card group overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-white/20"><div className={`item-art ${color} relative grid aspect-[4/3] place-items-center overflow-hidden`}><span className="absolute inset-0 bg-gradient-to-t from-[#15121c]/65 to-transparent"/><span className="relative rounded-full border border-white/10 bg-[#15121c]/35 px-4 py-2 text-[11px] font-medium tracking-[.14em] text-white/70 backdrop-blur-sm">{category.toUpperCase()}</span><span className="absolute left-3 top-3"><Badge status={status}>{status}</Badge></span><ArrowUpRight className="absolute bottom-3 right-3 text-white/60 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" size={18} /></div><div className="p-4"><h3 className="font-semibold">{name}</h3><p className="mt-1 text-sm text-[#8e8799]">{detail}</p></div></article>;
}

export function useToast() { const [message, setMessage] = useState(""); return { showToast: (next: string) => setMessage(next), toast: message ? <Toast message={message} onClose={() => setMessage("")} /> : null }; }
