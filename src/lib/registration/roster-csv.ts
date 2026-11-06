import { PES_SRN_PATTERN } from "./schema.ts";
import { z } from "zod";

export const ROSTER_CSV_HEADERS = ["university_id", "srn", "auth_email"] as const;
export const MAX_ROSTER_CSV_BYTES = 5 * 1024 * 1024;
const MAX_ROSTER_ROWS = 10_000;

export type RosterCsvRow = {
  universityId: string;
  normalizedSrn: string;
  authEmail: string;
};

export type RosterCsvError = {
  row: number;
  field: string;
  code: string;
};

export type RosterCsvResult =
  | { success: true; rows: RosterCsvRow[] }
  | { success: false; errors: RosterCsvError[] };

const csvRowSchema = z.object({
  university_id: z.string().trim().transform((value) => value.toLowerCase()).pipe(z.string().uuid()),
  srn: z.string().trim().min(1).max(20).transform((value) => value.toUpperCase())
    .pipe(z.string().regex(PES_SRN_PATTERN)),
  auth_email: z.string().trim().min(1).max(254).email().transform((value) => value.toLowerCase()),
});

function parseRecord(line: string): string[] | null {
  const fields: string[] = [];
  let field = "";
  let inQuotes = false;
  let quoteClosed = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (inQuotes) {
      if (character === '"') {
        if (line[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
          quoteClosed = true;
        }
      } else {
        field += character;
      }
      continue;
    }

    if (quoteClosed) {
      if (character === ",") {
        fields.push(field);
        field = "";
        quoteClosed = false;
      } else if (character !== " " && character !== "\t") {
        return null;
      }
      continue;
    }

    if (character === ",") {
      fields.push(field);
      field = "";
    } else if (character === '"') {
      if (field.trim() !== "") return null;
      field = "";
      inQuotes = true;
    } else {
      field += character;
    }
  }

  if (inQuotes) return null;
  fields.push(field);
  return fields;
}

function fieldErrorCode(field: string) {
  if (field === "university_id") return "invalid_university_id";
  if (field === "srn") return "invalid_srn";
  if (field === "auth_email") return "invalid_auth_email";
  return "invalid_row";
}

/** Parse and validate an authorized roster CSV without performing database writes. */
export function parseRosterCsv(csv: string): RosterCsvResult {
  if (new TextEncoder().encode(csv).byteLength > MAX_ROSTER_CSV_BYTES) {
    return { success: false, errors: [{ row: 0, field: "file", code: "file_too_large" }] };
  }

  const lines = csv.replace(/^\uFEFF/, "").split(/\r?\n/);
  const headerLine = lines[0] ?? "";
  const headers = parseRecord(headerLine)?.map((header) => header.trim().toLowerCase());
  if (
    !headers ||
    headers.length !== ROSTER_CSV_HEADERS.length ||
    new Set(headers).size !== headers.length ||
    !ROSTER_CSV_HEADERS.every((header) => headers.includes(header))
  ) {
    return { success: false, errors: [{ row: 1, field: "header", code: "invalid_headers" }] };
  }

  const fieldIndexes = Object.fromEntries(headers.map((header, index) => [header, index]));
  const rows: RosterCsvRow[] = [];
  const errors: RosterCsvError[] = [];
  const seenStudentKeys = new Set<string>();
  const seenEmails = new Set<string>();
  let dataRowCount = 0;

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    if (!lines[lineIndex].trim()) continue;
    dataRowCount += 1;
    const rowNumber = lineIndex + 1;
    if (dataRowCount > MAX_ROSTER_ROWS) {
      errors.push({ row: rowNumber, field: "file", code: "too_many_rows" });
      break;
    }

    const values = parseRecord(lines[lineIndex]);
    if (!values || values.length !== headers.length) {
      errors.push({ row: rowNumber, field: "row", code: "invalid_csv_row" });
      continue;
    }

    const parsed = csvRowSchema.safeParse({
      university_id: values[fieldIndexes.university_id],
      srn: values[fieldIndexes.srn],
      auth_email: values[fieldIndexes.auth_email],
    });
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0] ?? "row");
        errors.push({ row: rowNumber, field, code: fieldErrorCode(field) });
      }
      continue;
    }

    const studentKey = `${parsed.data.university_id}:${parsed.data.srn}`;
    if (seenStudentKeys.has(studentKey)) {
      errors.push({ row: rowNumber, field: "srn", code: "duplicate_student" });
      continue;
    }
    if (seenEmails.has(parsed.data.auth_email)) {
      errors.push({ row: rowNumber, field: "auth_email", code: "duplicate_email" });
      continue;
    }

    seenStudentKeys.add(studentKey);
    seenEmails.add(parsed.data.auth_email);
    rows.push({
      universityId: parsed.data.university_id,
      normalizedSrn: parsed.data.srn,
      authEmail: parsed.data.auth_email,
    });
  }

  if (dataRowCount === 0) errors.push({ row: 1, field: "file", code: "empty_roster" });
  if (errors.length > 0) return { success: false, errors };
  return { success: true, rows };
}
