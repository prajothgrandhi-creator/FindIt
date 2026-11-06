"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

export function MarkAllReadButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function markAll() {
    setPending(true);
    try {
      const response = await fetch("/api/notifications/read", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      const body = await response.json().catch(() => ({})) as { message?: string };
      if (!response.ok) setMessage(body.message ?? "Notifications could not be updated.");
      else { setMessage("Notifications marked as read."); router.refresh(); }
    } catch {
      setMessage("Notifications are temporarily unavailable.");
    } finally {
      setPending(false);
    }
  }

  return <div className="flex items-center gap-3">{message && <span role="status" className="text-sm text-muted">{message}</span>}<Button type="button" variant="secondary" disabled={pending} onClick={markAll}>{pending ? "Updating…" : "Mark all as read"}</Button></div>;
}
