import "server-only";
import { NextResponse } from "next/server";
import type { ClientSession } from "mongodb";
import { getRosterAdminContext } from "@/lib/auth/roster-admin";
import { getDatabase, getMongoClient } from "@/lib/mongodb/server";
import { parseRosterCsv, MAX_ROSTER_CSV_BYTES } from "@/lib/registration/roster-csv";
import type { UniversityDocument, StudentRosterDocument } from "@/lib/mongodb/types";

async function readCsv(request: Request): Promise<{ csv: string } | { error: "too_large" | "invalid_encoding" }> {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_ROSTER_CSV_BYTES) return { error: "too_large" };
  if (!request.body) return { csv: "" };

  const reader = request.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let csv = "";
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_ROSTER_CSV_BYTES) {
        await reader.cancel();
        return { error: "too_large" };
      }
      csv += decoder.decode(value, { stream: true });
    }
    return { csv: csv + decoder.decode() };
  } catch {
    return { error: "invalid_encoding" };
  } finally {
    reader.releaseLock();
  }
}

function requestOrigin(request: Request) {
  const host = request.headers.get("x-forwarded-host")?.split(",")[0].trim()
    || request.headers.get("host");
  if (!host) return null;
  const protocol = request.headers.get("x-forwarded-proto")?.split(",")[0].trim()
    || new URL(request.url).protocol.replace(":", "");
  return `${protocol}://${host}`;
}

export async function POST(request: Request) {
  const access = await getRosterAdminContext();
  if (access.kind === "unauthenticated") return NextResponse.json({ message: "Sign in is required." }, { status: 401 });
  if (access.kind === "forbidden") return NextResponse.json({ message: "Administrator access is required." }, { status: 403 });
  if (access.kind !== "authorized") return NextResponse.json({ message: "Roster import is not configured." }, { status: 503 });

  const origin = requestOrigin(request);
  if (!origin || request.headers.get("origin") !== origin) {
    return NextResponse.json({ message: "Request origin is not allowed." }, { status: 403 });
  }
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "text/csv") {
    return NextResponse.json({ message: "Send the roster as a CSV file." }, { status: 415 });
  }

  const body = await readCsv(request);
  if ("error" in body) {
    const tooLarge = body.error === "too_large";
    return NextResponse.json({ message: tooLarge ? "CSV exceeds the 5 MB limit." : "CSV must be valid UTF-8." }, { status: tooLarge ? 413 : 400 });
  }
  const parsed = parseRosterCsv(body.csv);
  if (!parsed.success) return NextResponse.json({ message: "CSV validation failed.", errors: parsed.errors }, { status: 422 });

  let session: ClientSession | undefined;
  try {
    const [db, client] = await Promise.all([getDatabase(), getMongoClient()]);
    session = client.startSession();
    await session.withTransaction(async () => {
      const universityIds = [...new Set(parsed.rows.map((row) => row.universityId))];
      const activeUniversities = await db.collection<UniversityDocument>("universities").find(
        { _id: { $in: universityIds }, isActive: true },
        { session },
      ).project({ _id: 1 }).toArray();
      const activeIds = new Set(activeUniversities.map((university) => String(university._id)));
      if (universityIds.some((id) => !activeIds.has(id))) throw new Error("inactive_university");

      const roster = db.collection<StudentRosterDocument>("student_roster");
      const keys = parsed.rows.map((row) => ({ universityId: row.universityId, normalizedSrn: row.normalizedSrn }));
      const existing = await roster.find({ $or: keys }, { session }).limit(1).toArray();
      if (existing.length > 0) throw new Error("duplicate_roster_entry");

      await roster.insertMany(parsed.rows.map((row) => ({
        universityId: row.universityId,
        normalizedSrn: row.normalizedSrn,
        authEmail: row.authEmail,
        isActive: true,
        createdAt: new Date(),
      })), { session, ordered: true });
    });
    console.info(`[roster-import] ${JSON.stringify({ event: "import_succeeded", rowCount: parsed.rows.length })}`);
    return NextResponse.json({ importedCount: parsed.rows.length }, { status: 201 });
  } catch (error) {
    const candidate = error && typeof error === "object" ? error as { code?: unknown; message?: unknown } : {};
    if (candidate.message === "inactive_university") {
      return NextResponse.json({ message: "CSV contains an unknown or inactive university identifier." }, { status: 422 });
    }
    if (candidate.message === "duplicate_roster_entry" || candidate.code === 11000) {
      return NextResponse.json({ message: "One or more records already exist. No rows were imported." }, { status: 409 });
    }
    const code = typeof candidate.code === "string" && /^[A-Za-z0-9_-]{1,32}$/.test(candidate.code)
      ? candidate.code
      : undefined;
    console.error(`[roster-import] ${JSON.stringify({ event: "import_failed", ...(code ? { code } : {}) })}`);
    return NextResponse.json({ message: "Roster import could not be completed." }, { status: 503 });
  } finally {
    await session?.endSession();
  }
}
