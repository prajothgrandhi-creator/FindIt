"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import type { ReportStatus } from "@/lib/mysql/types";

export function ReportStatusControl({ reportId, status }: { reportId: string; status: ReportStatus }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const nextStatus: ReportStatus = status === "open" ? "resolved" : "open";

  async function update() {
    setPending(true);
    setMessage("");
    try {
      const response = await fetch(`/api/reports/${reportId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: nextStatus }) });
      const body = await response.json().catch(() => ({})) as { message?: string };
      if (!response.ok) setMessage(body.message ?? "Status update failed.");
      else { setMessage(body.message ?? "Report updated."); router.refresh(); }
    } catch {
      setMessage("Report updates are temporarily unavailable.");
    } finally {
      setPending(false);
    }
  }

  return <div className="flex flex-wrap items-center gap-3"><Button type="button" variant="secondary" disabled={pending} onClick={update}>{pending ? "Updating…" : status === "open" ? "Mark as resolved" : "Reopen report"}</Button>{message && <span role="status" className="text-sm text-muted">{message}</span>}</div>;
}
