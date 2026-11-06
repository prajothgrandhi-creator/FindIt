import { Card, Skeleton } from "@/components/ui";

export default function NotificationsLoading() {
  return <div aria-label="Loading notifications" className="mx-auto max-w-5xl space-y-5"><div className="mb-9 space-y-3"><Skeleton className="h-3 w-40" /><Skeleton className="h-10 w-64" /><Skeleton className="h-5 w-full max-w-2xl" /></div><Card className="divide-y divide-border p-6">{[0, 1, 2, 3].map((item) => <div key={item} className="space-y-2 py-4 first:pt-0 last:pb-0"><Skeleton className="h-5 w-1/2" /><Skeleton className="h-4 w-full" /></div>)}</Card></div>;
}
