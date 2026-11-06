import "server-only";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import { z } from "zod";
import { getCurrentStudentSession } from "@/lib/auth/session";
import { getMysqlPool } from "@/lib/mysql/server";

const schema = z.object({
  reportId: z.string().uuid(),
  description: z.string().trim().max(500),
  location: z.string().trim().max(160),
  occurredAt: z.string().refine((value) => !value || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value), "Enter a valid date and time."),
}).strict();

type ReportRow = RowDataPacket & { id: string; owner_id: string; item_name: string; type: "lost" | "found"; status: string };

export async function POST(request: Request) {
  const current = await getCurrentStudentSession();
  if (!current) return NextResponse.json({ message: "Sign in to report a sighting." }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Review the sighting and try again." }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Review the sighting details." }, { status: 400 });

  const connection = await getMysqlPool().getConnection();
  try {
    const [rows] = await connection.execute<ReportRow[]>("SELECT id, owner_id, item_name, type, status FROM reports WHERE id = ? LIMIT 1", [parsed.data.reportId]);
    const report = rows[0];
    if (!report || report.type !== "lost" || report.status !== "open") return NextResponse.json({ message: "This lost report is no longer open for sightings." }, { status: 404 });
    if (report.owner_id === current.profile._id) return NextResponse.json({ message: "You cannot report a sighting on your own report." }, { status: 400 });

    const id = randomUUID();
    const occurredAt = parsed.data.occurredAt ? `${parsed.data.occurredAt.replace("T", " ")}:00.000` : null;
    await connection.beginTransaction();
    await connection.execute(
      "INSERT INTO sightings (id, report_id, reporter_id, description, location, occurred_at) VALUES (?, ?, ?, ?, ?, ?)",
      [id, report.id, current.profile._id, parsed.data.description, parsed.data.location, occurredAt],
    );
    await connection.execute(
      "INSERT INTO notifications (id, user_id, kind, title, body, href) VALUES (?, ?, 'item_sighting', ?, ?, ?)",
      [randomUUID(), report.owner_id, "A student reported a sighting", `A campus member saw something related to your ${report.item_name} report.`, "/my-reports"],
    );
    await connection.commit();
    return NextResponse.json({ id, message: "Your sighting was sent privately to the report owner." }, { status: 201 });
  } catch (error) {
    await connection.rollback().catch(() => {});
    const code = error && typeof error === "object" && "code" in error && typeof error.code === "string" ? error.code : "SIGHTING_FAILED";
    console.error(`[sightings] ${JSON.stringify({ event: "create_failed", code })}`);
    return NextResponse.json({ message: "Sightings are temporarily unavailable. Please try again." }, { status: 503 });
  } finally {
    connection.release();
  }
}
