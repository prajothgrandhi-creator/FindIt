import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { Button, Card, PageHeader } from "@/components/ui";

export function PlaceholderPage({ first, second, description, eyebrow = "COMING INTO FOCUS" }: { first: string; second: string; description: string; eyebrow?: string }) {
  return <div className="mx-auto max-w-3xl py-7"><PageHeader eyebrow={eyebrow} first={first} second={second} description={description} /><Card className="p-6 sm:p-8"><div className="flex gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-elevated text-accent-bright"><LockKeyhole size={18} /></span><div><h2 className="font-semibold">This workflow is not connected yet</h2><p className="mt-2 text-sm leading-6 text-muted">This area is part of the FindIt workspace. Its data and actions will appear when the corresponding verified workflow is implemented.</p><div className="mt-5 flex flex-wrap gap-3"><Link href="/browse"><Button>Browse reports <ArrowRight size={15} /></Button></Link><Link href="/dashboard"><Button variant="secondary">Back to dashboard</Button></Link></div></div></div></Card></div>;
}
