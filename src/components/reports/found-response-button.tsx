"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

export function FoundResponseButton({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function respond() {
    setPending(true);
    setFeedback("");
    try {
      const response = await fetch("/api/found-responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lostReportId: reportId }),
      });
      const body = await response.json().catch(() => ({})) as { message?: string };
      setFeedback(body.message ?? (response.ok ? "Your found report was linked." : "The response could not be sent."));
      if (response.ok) router.refresh();
    } catch {
      setFeedback("Found item responses are temporarily unavailable. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return <div>
    <Button type="button" onClick={respond} disabled={pending}>{pending ? "Checking your reports…" : "I found this item"}</Button>
    {feedback && <p role="status" className="mt-2 max-w-md text-sm text-muted">{feedback}</p>}
  </div>;
}
