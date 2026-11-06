import { Card, Skeleton } from "@/components/ui";

export default function ReportLoading() {
  return <div aria-label="Loading report form" className="mx-auto max-w-4xl space-y-5">
    <Skeleton className="h-5 w-36" />
    <div className="mb-9 space-y-3"><Skeleton className="h-3 w-40" /><Skeleton className="h-10 w-64" /><Skeleton className="h-5 w-full max-w-2xl" /></div>
    {["report-type", "item-details", "where-when", "image"].map((section) => <Card key={section} className="space-y-4 p-5 sm:p-7"><Skeleton className="h-6 w-40" /><Skeleton className="h-11 w-full" /><Skeleton className="h-11 w-full" /></Card>)}
  </div>;
}
