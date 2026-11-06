import { Card, Skeleton } from "@/components/ui";

export default function MyReportsLoading() {
  return <div aria-label="Loading your reports" className="mx-auto max-w-5xl space-y-5"><div className="mb-9 space-y-3"><Skeleton className="h-3 w-40" /><Skeleton className="h-10 w-64" /><Skeleton className="h-5 w-full max-w-2xl" /></div><Card className="space-y-4 p-7"><Skeleton className="h-7 w-64" /><Skeleton className="h-5 w-full" /><Skeleton className="h-5 w-3/4" /></Card></div>;
}
