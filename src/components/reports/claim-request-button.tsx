"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, Textarea } from "@/components/ui";

export function ClaimRequestButton({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFeedback("");
    try {
      const response = await fetch("/api/claims", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reportId, message }) });
      const body = await response.json().catch(() => ({})) as { message?: string };
      setFeedback(body.message ?? (response.ok ? "Claim sent." : "Claim could not be sent."));
      if (response.ok) { setOpen(false); setMessage(""); router.refresh(); }
    } catch {
      setFeedback("Claims are temporarily unavailable. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      {!open ? <Button type="button" onClick={() => setOpen(true)}>Send a private claim</Button> : (
        <form onSubmit={submit} className="space-y-3">
          <label htmlFor={`claim-${reportId}`} className="block text-sm font-semibold">Explain why you believe this item is yours</label>
          <Textarea id={`claim-${reportId}`} value={message} onChange={(event) => setMessage(event.currentTarget.value)} maxLength={1000} minLength={10} required disabled={pending} placeholder="Share a private identifying detail with the report owner." />
          <div className="flex flex-wrap gap-2"><Button type="submit" disabled={pending}>{pending ? "Sending…" : "Send claim"}</Button><Button type="button" variant="ghost" disabled={pending} onClick={() => setOpen(false)}>Cancel</Button></div>
        </form>
      )}
      {feedback && <p role="status" className="mt-3 text-sm text-muted">{feedback}</p>}
    </div>
  );
}
