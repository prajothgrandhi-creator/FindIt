"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import { AlertCircle, ImagePlus, LockKeyhole, Trash2 } from "lucide-react";
import { Button, Card, Input, Textarea } from "@/components/ui";
import { reportDraftSchema, type ReportDraft } from "@/lib/reports/draft-schema";

type ReportType = "lost" | "found" | "";
type FieldName = keyof ReportDraft;
type DraftErrors = Partial<Record<FieldName, string>>;
const imageLimit = 5 * 1024 * 1024;
const emptyDraft: ReportDraft = { type: "lost", itemName: "", description: "", location: "", occurredAt: "" };

export function ReportForm({ initialType, relatedLostId, relatedLostItem }: { initialType: ReportType; relatedLostId?: string; relatedLostItem?: string }) {
  const router = useRouter();
  const [draft, setDraft] = useState<ReportDraft>({ ...emptyDraft, itemName: relatedLostItem ?? "", type: initialType || "lost" });
  const [errors, setErrors] = useState<DraftErrors>({});
  const [notice, setNotice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!image) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(image);
    return () => reader.abort();
  }, [image]);

  function updateField(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.currentTarget;
    if (name !== "type" && name !== "itemName" && name !== "description" && name !== "location" && name !== "occurredAt") return;
    setDraft((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setNotice("");
  }

  function chooseImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0] ?? null;
    event.currentTarget.value = "";
    setImageError("");
    setNotice("");
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setImageError("Choose a JPG, PNG, or WebP image. It will only be previewed on this device.");
      setImagePreview("");
      setImage(null);
      return;
    }
    if (file.size > imageLimit) {
      setImageError("Choose an image smaller than 5 MB. It will only be previewed on this device.");
      setImagePreview("");
      setImage(null);
      return;
    }
    setImage(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setNotice("");
    const result = reportDraftSchema.safeParse(draft);
    if (!result.success) {
      const nextErrors: DraftErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string" && field in draft && !nextErrors[field as FieldName]) nextErrors[field as FieldName] = issue.message;
      }
      setErrors(nextErrors);
      const firstInvalid = Object.keys(nextErrors)[0];
      if (firstInvalid) document.getElementById(`report-${firstInvalid}`)?.focus();
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    const formData = new FormData(form);
    if (image) formData.set("image", image);
    if (relatedLostId) formData.set("relatedLostId", relatedLostId);
    try {
      const response = await fetch("/api/reports", { method: "POST", body: formData });
      const body = await response.json().catch(() => ({})) as { message?: string };
      if (!response.ok) {
        setNotice(body.message ?? "Report submission failed. Please try again.");
        return;
      }
      router.push("/my-reports?created=1");
      router.refresh();
    } catch {
      setNotice("Report submission is temporarily unavailable. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const describedBy = (field: FieldName, helperId?: string) => [helperId, errors[field] ? `report-${field}-error` : undefined].filter(Boolean).join(" ") || undefined;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Card className="p-5 sm:p-7">
        <fieldset>
          <legend className="text-base font-bold">What happened?</legend>
          <p className="mt-1 text-sm text-muted">Choose the report type. You can change it at any time.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(["lost", "found"] as const).map((type) => (
              <label key={type} className={`focus-within:ring-2 focus-within:ring-accent flex min-h-[76px] cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${draft.type === type ? "border-accent bg-accent/10" : "border-border bg-background/30 hover:border-accent/40"}`}>
                <input type="radio" name="type" value={type} checked={draft.type === type} onChange={updateField} className="mt-1 accent-accent" />
                <span><span className="block font-semibold">{type === "lost" ? "I Lost an Item" : "I Found an Item"}</span><span className="mt-1 block text-sm text-muted">{type === "lost" ? "Tell the campus what went missing." : "Help someone identify and recover an item."}</span></span>
              </label>
            ))}
          </div>
          {errors.type && <p id="report-type-error" className="mt-2 text-sm text-danger">{errors.type}</p>}
        </fieldset>
      </Card>

      <Card className="p-5 sm:p-7">
        <h2 className="text-base font-bold">Item details</h2>
        <p className="mt-1 text-sm text-muted">Only enter general details. Keep unique proof-of-ownership details private.</p>
        {relatedLostItem && <p className="mt-4 rounded-lg border border-accent/25 bg-accent/5 p-3 text-sm leading-6 text-muted">This found report will be linked to the open lost report for <span className="font-semibold text-text">{relatedLostItem}</span> and the owner will be notified.</p>}
        <div className="mt-5 space-y-5">
          <div>
            <label htmlFor="report-itemName" className="mb-2 block text-sm font-semibold">Item name <span className="text-danger">(required)</span></label>
            <Input id="report-itemName" name="itemName" value={draft.itemName} onChange={updateField} maxLength={120} placeholder="e.g. Black water bottle" aria-invalid={Boolean(errors.itemName)} aria-describedby={describedBy("itemName", "report-itemName-help")} />
            <p id="report-itemName-help" className="mt-1.5 text-xs text-subtle">Up to 120 characters.</p>
            {errors.itemName && <p id="report-itemName-error" className="mt-1.5 text-sm text-danger">{errors.itemName}</p>}
          </div>
          <div>
            <label htmlFor="report-description" className="mb-2 block text-sm font-semibold">General description <span className="font-normal text-muted">(optional)</span></label>
            <Textarea id="report-description" name="description" value={draft.description} onChange={updateField} maxLength={1000} placeholder="Describe the item without sharing private contact or identification details." aria-invalid={Boolean(errors.description)} aria-describedby={describedBy("description", "report-description-help")} />
            <p id="report-description-help" className="mt-1.5 text-xs text-subtle">Up to 1,000 characters. Keep distinctive identifying details private.</p>
            {errors.description && <p id="report-description-error" className="mt-1.5 text-sm text-danger">{errors.description}</p>}
          </div>
        </div>
      </Card>

      <Card className="p-5 sm:p-7">
        <h2 className="text-base font-bold">Where and when</h2>
          <p className="mt-1 text-sm text-muted">Add the general place and time. These details are saved with your report.</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="report-location" className="mb-2 block text-sm font-semibold">General location <span className="font-normal text-muted">(optional)</span></label>
            <Input id="report-location" name="location" value={draft.location} onChange={updateField} maxLength={160} placeholder="e.g. Library, near the second floor" aria-invalid={Boolean(errors.location)} aria-describedby={describedBy("location", "report-location-help")} />
            <p id="report-location-help" className="mt-1.5 text-xs text-subtle">Avoid precise or private location details.</p>
            {errors.location && <p id="report-location-error" className="mt-1.5 text-sm text-danger">{errors.location}</p>}
          </div>
          <div>
            <label htmlFor="report-occurredAt" className="mb-2 block text-sm font-semibold">Date and time <span className="font-normal text-muted">(optional)</span></label>
            <Input id="report-occurredAt" name="occurredAt" type="datetime-local" value={draft.occurredAt} onChange={updateField} aria-invalid={Boolean(errors.occurredAt)} aria-describedby={describedBy("occurredAt")} />
            {errors.occurredAt && <p id="report-occurredAt-error" className="mt-1.5 text-sm text-danger">{errors.occurredAt}</p>}
          </div>
        </div>
      </Card>

      <Card className="p-5 sm:p-7">
        <h2 className="text-base font-bold">Item image <span className="font-normal text-muted">(optional)</span></h2>
        <p className="mt-1 text-sm text-muted">A selected image is previewed locally only. It is not uploaded or saved.</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label htmlFor="report-image" className="focus-within:ring-2 focus-within:ring-accent inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold hover:bg-elevated/50"><ImagePlus size={17} aria-hidden="true" />Choose image</label>
          <input id="report-image" type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseImage} className="sr-only" aria-describedby={imageError ? "report-image-error" : "report-image-help"} />
          <span id="report-image-help" className="text-xs text-subtle">JPG, PNG, or WebP; maximum 5 MB.</span>
        </div>
        {imageError && <p id="report-image-error" role="alert" className="mt-2 text-sm text-danger">{imageError}</p>}
        {imagePreview && <div className="mt-4 flex flex-wrap items-start gap-3"><Image src={imagePreview} alt="Preview of the selected item" width={320} height={220} unoptimized className="h-40 w-56 rounded-lg border border-border object-cover" /><div><p className="max-w-56 truncate text-sm font-medium">{image?.name}</p><p className="mt-1 text-xs text-subtle">This image will be saved with the report.</p><Button type="button" variant="ghost" onClick={() => { setImagePreview(""); setImage(null); }} className="mt-2 min-h-9 px-2"><Trash2 size={15} aria-hidden="true" />Remove image</Button></div></div>}
      </Card>

      <div role="note" className="flex gap-3 rounded-xl border border-warning/25 bg-warning/5 p-4 text-sm leading-6 text-muted"><LockKeyhole size={18} className="mt-0.5 shrink-0 text-warning" aria-hidden="true" /><p>Your report is linked to your account and visible to the campus community. Do not include personal contact details or private proof-of-ownership information.</p></div>
      {notice && <p role="status" className="rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm leading-6 text-warning">{notice}</p>}
      {Object.keys(errors).length > 0 && <p role="alert" className="flex items-center gap-2 text-sm text-danger"><AlertCircle size={16} aria-hidden="true" />Check the highlighted fields.</p>}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Publishing…" : "Publish report"}</Button>
        <Link href="/my-reports" className="focus-ring inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-5 text-sm font-semibold text-muted hover:bg-elevated/50 hover:text-text">My Reports</Link>
        <Link href="/browse" className="focus-ring inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold text-muted hover:text-text">Cancel</Link>
      </div>
    </form>
  );
}
