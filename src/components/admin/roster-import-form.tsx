"use client";

import { useState, type FormEvent } from "react";
import { Button, Card } from "@/components/ui";

type ImportResponse = { message?: string; importedCount?: number };

export function RosterImportForm() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!file) {
      setError(true);
      setMessage("Choose a CSV file to import.");
      return;
    }

    setPending(true);
    setError(false);
    setMessage("");
    try {
      const response = await fetch("/api/admin/roster-import", {
        method: "POST",
        headers: { "Content-Type": "text/csv" },
        body: file,
      });
      const body = (await response.json().catch(() => ({}))) as ImportResponse;
      if (!response.ok) {
        setError(true);
        setMessage(body.message ?? "Roster import could not be completed.");
      } else {
        setFile(null);
        form.reset();
        setMessage(`Imported ${body.importedCount ?? 0} roster records.`);
      }
    } catch {
      setError(true);
      setMessage("Roster import could not be completed. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="max-w-3xl p-5 sm:p-8">
      <h2 className="text-lg font-bold">Import an authorized student roster</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Upload a UTF-8 CSV with the headers <code className="text-text">university_id,srn,auth_email</code>.
        These records are retained for university eligibility workflows. Email confirmation is not used during signup.
      </p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="roster-csv" className="mb-2 block text-sm font-semibold">Roster CSV</label>
          <input
            id="roster-csv"
            type="file"
            accept=".csv,text/csv"
            disabled={pending}
            onChange={(event) => setFile(event.currentTarget.files?.[0] ?? null)}
            className="focus-ring block min-h-11 w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-text file:mr-4 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[#15121C]"
          />
        </div>
        {message && <p role={error ? "alert" : "status"} className={error ? "text-sm text-danger" : "text-sm text-success"}>{message}</p>}
        <Button type="submit" disabled={pending}>{pending ? "Importing…" : "Import roster"}</Button>
      </form>
    </Card>
  );
}
