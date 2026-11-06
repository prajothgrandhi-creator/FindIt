"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Textarea } from "@/components/ui";

export function ReportSightingButton({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [occurredAt, setOccurredAt] = useState("");
  const [feedback, setFeedback] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFeedback("");
    try {
      const response = await fetch("/api/sightings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, description, location, occurredAt }),
      });
      const body = await response.json().catch(() => ({})) as { message?: string };
      setFeedback(body.message ?? (response.ok ? "Sighting sent." : "Sighting could not be sent."));
      if (response.ok) { setOpen(false); setDescription(""); setLocation(""); setOccurredAt(""); router.refresh(); }
    } catch {
      setFeedback("Sightings are temporarily unavailable. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return <div>
    {!open ? <Button type="button" variant="secondary" onClick={() => setOpen(true)}>Report a sighting</Button> : <form onSubmit={submit} className="grid w-full gap-3 rounded-lg border border-border bg-background/40 p-4 sm:grid-cols-2">
      <p className="text-sm text-muted sm:col-span-2">Share where and when you saw something related. A sighting does not mean you have the item.</p>
      <label className="text-sm font-semibold">Location<Input value={location} onChange={(event) => setLocation(event.currentTarget.value)} maxLength={160} className="mt-2" placeholder="Where did you see it?" /></label>
      <label className="text-sm font-semibold">Approximate time<Input type="datetime-local" value={occurredAt} onChange={(event) => setOccurredAt(event.currentTarget.value)} className="mt-2" /></label>
      <label className="text-sm font-semibold sm:col-span-2">What did you see? <span className="font-normal text-muted">(optional)</span><Textarea value={description} onChange={(event) => setDescription(event.currentTarget.value)} maxLength={500} className="mt-2" placeholder="Keep unique identifying details private." /></label>
      <div className="flex flex-wrap gap-2 sm:col-span-2"><Button type="submit" disabled={pending}>{pending ? "Sending…" : "Send sighting"}</Button><Button type="button" variant="ghost" disabled={pending} onClick={() => setOpen(false)}>Cancel</Button></div>
    </form>}
    {feedback && <p role="status" className="mt-3 text-sm text-muted">{feedback}</p>}
  </div>;
}
