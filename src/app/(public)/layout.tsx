import type { ReactNode } from "react";
import { PublicNav } from "@/components/layout/public-nav";
import { PublicFooter } from "@/components/layout/public-footer";

export default function PublicLayout({ children }: { children: ReactNode }) { return <><PublicNav /><main className="min-h-[65vh]">{children}</main><PublicFooter /></>; }
