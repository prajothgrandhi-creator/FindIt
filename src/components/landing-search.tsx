"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button, Input } from "@/components/ui";

export function LandingSearch() {
  const [kind, setKind] = useState("all");
  const router = useRouter();
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); const q = String(data.get("q") ?? "").trim(); const params = new URLSearchParams(); if (q) params.set("q", q); if (kind !== "all") params.set("type", kind); router.push(`/browse${params.size ? `?${params.toString()}` : ""}`); }
  return <form onSubmit={submit} className="surface-card grid gap-3 p-3 md:grid-cols-[1fr_auto]"><label className="flex items-center gap-3 px-2"><Search size={18} className="shrink-0 text-[#8e8799]" /><span className="sr-only">Search items</span><Input name="q" placeholder="Search items, details, or locations" className="border-0 bg-transparent px-0 focus-visible:outline-none" /></label><div className="flex items-center gap-2"><div className="inline-flex flex-1 rounded-lg bg-[#201c28] p-1" aria-label="Report type">{["all", "lost", "found"].map((option) => <button type="button" aria-pressed={kind === option} onClick={() => setKind(option)} key={option} className={`flex-1 rounded-md px-3 py-2 text-xs font-medium capitalize ${kind === option ? "bg-[#42374e] text-white" : "text-[#8e8799]"}`}>{option}</button>)}</div><Button type="submit" className="shrink-0 px-4"><span className="hidden sm:inline">Search</span><Search size={16} className="sm:hidden" /><span className="sr-only sm:hidden">Search</span></Button></div></form>;
}
