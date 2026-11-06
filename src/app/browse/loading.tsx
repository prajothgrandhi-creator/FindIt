import { Card, PageHeader, Skeleton } from "@/components/ui";

export default function BrowseLoading() {
  return (
    <div className="mx-auto max-w-6xl" role="status" aria-label="Loading browse items">
      <PageHeader eyebrow="CAMPUS REPORTS" first="Browse" second="Items." description="Loading campus reports." />
      <Card className="grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_190px_auto]">
        <Skeleton className="h-11" />
        <Skeleton className="h-11" />
        <Skeleton className="h-11 w-full md:w-36" />
      </Card>
      <Skeleton className="mt-8 h-64" />
    </div>
  );
}
