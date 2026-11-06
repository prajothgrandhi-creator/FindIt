"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

export function ClaimDecision({ claimId }: { claimId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function decide(status: "accepted" | "declined") {
    setPending(true);
    setMessage("");
    try {
      const response = await fetch(`/api/claims/${claimId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      const body = await response.json().catch(() => ({})) as { message?: string };
      if (!response.ok) setMessage(body.message ?? "Claim update failed.");
      else { setMessage(body.message ?? "Claim updated."); router.refresh(); }
    } catch {
      setMessage("Claims are temporarily unavailable.");
    } finally {
      setPending(false);
    }
  }

  return <div className="mt-4"><div className="flex flex-wrap gap-2"><Button type="button" disabled={pending} onClick={() => decide("accepted")}>Accept claim</Button><Button type="button" variant="secondary" disabled={pending} onClick={() => decide("declined")}>Decline</Button></div>{message && <p role="status" className="mt-2 text-sm text-muted">{message}</p>}</div>;
}
