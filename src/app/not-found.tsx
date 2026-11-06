import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button, PageHeader } from "@/components/ui";
export default function NotFound() { return <main className="shell grid min-h-screen max-w-3xl place-items-center py-14"><div className="w-full"><PageHeader eyebrow="404 · PAGE NOT FOUND" first="Looks like this" second="item wandered off." description="The page you’re looking for may have moved, or it may not exist yet." /><Link href="/"><Button><ArrowLeft size={15} /> Back to FindIt</Button></Link></div></main>; }
