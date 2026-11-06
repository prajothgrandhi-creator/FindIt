import { z } from "zod";

function isValidLocalDateTime(value: string) {
  if (!value) return true;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return false;
  const [, yearText, monthText, dayText, hourText, minuteText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const date = new Date(year, month - 1, day, hour, minute);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    && date.getHours() === hour && date.getMinutes() === minute;
}

export const reportDraftSchema = z.object({
  type: z.enum(["lost", "found"], { error: "Choose whether you lost or found the item." }),
  itemName: z.string().trim().min(1, "Enter an item name.").max(120, "Item name must be 120 characters or fewer."),
  description: z.string().trim().max(1000, "Description must be 1,000 characters or fewer."),
  location: z.string().trim().max(160, "Location must be 160 characters or fewer."),
  occurredAt: z.string().refine(isValidLocalDateTime, "Enter a valid date and time."),
}).strict();

export type ReportDraft = z.infer<typeof reportDraftSchema>;
