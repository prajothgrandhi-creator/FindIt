import { Card, Skeleton } from "@/components/ui";

export default function ClaimsLoading() {
  return <div aria-label="Loading claims" className="mx-auto max-w-5xl space-y-5"><div className="mb-9 space-y-3"><Skeleton className="h-3 w-40" /><Skeleton className="h-10 w-64" /><Skeleton className="h-5 w-full max-w-2xl" /></div><div className="grid gap-4 md:grid-cols-2">{[0, 1].map((item) => <Card key={item} className="space-y-4 p-6"><Skeleton className="h-3 w-32" /><Skeleton className="h-7 w-48" /><Skeleton className="h-4 w-full" /><Skeleton className="h-20 w-full" /></Card>)}</div></div>;
}
