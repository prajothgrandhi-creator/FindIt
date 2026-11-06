import "server-only";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import { z } from "zod";
import { getCurrentStudentSession } from "@/lib/auth/session";
import { getMysqlPool } from "@/lib/mysql/server";

type ReportRow = RowDataPacket & { id: string; owner_id: string; item_name: string; type: "lost" | "found"; status: string };
const claimSchema = z.object({ reportId: z.string().uuid(), message: z.string().trim().min(10, "Add a few details to help confirm the item.").max(1000, "Message must be 1,000 characters or fewer.") }).strict();

export async function POST(request: Request) {
  const current = await getCurrentStudentSession();
  if (!current) return NextResponse.json({ message: "Sign in to send a claim." }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Review the claim and try again." }, { status: 400 }); }
  const parsed = claimSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Review the claim fields." }, { status: 400 });

  const pool = getMysqlPool();
  const connection = await pool.getConnection();
  try {
    const [reports] = await connection.execute<ReportRow[]>("SELECT id, owner_id, item_name, type, status FROM reports WHERE id = ? LIMIT 1", [parsed.data.reportId]);
    const report = reports[0];
    if (!report || report.status !== "open") return NextResponse.json({ message: "This report is no longer open for claims." }, { status: 404 });
    if (report.type !== "found") return NextResponse.json({ message: "Claims are only for found items. Report that you found or saw this item instead." }, { status: 400 });
    if (report.owner_id === current.profile._id) return NextResponse.json({ message: "You cannot claim your own report." }, { status: 400 });

    await connection.beginTransaction();
    const claimId = randomUUID();
    await connection.execute(
      "INSERT INTO claims (id, report_id, report_owner_id, claimant_id, claimant_name, message, status) VALUES (?, ?, ?, ?, ?, ?, 'pending')",
      [claimId, report.id, report.owner_id, current.profile._id, current.profile.displayName, parsed.data.message],
    );
    await connection.execute(
      "INSERT INTO notifications (id, user_id, kind, title, body, href) VALUES (?, ?, 'claim_received', ?, ?, '/claims')",
      [randomUUID(), report.owner_id, "New claim on your report", `${current.profile.displayName} sent a claim for ${report.item_name}.`],
    );
    await connection.commit();
    return NextResponse.json({ id: claimId, message: "Your claim has been sent privately to the report owner." }, { status: 201 });
  } catch (error) {
    await connection.rollback().catch(() => {});
    const code = error && typeof error === "object" && "code" in error && typeof error.code === "string" ? error.code : "CLAIM_FAILED";
    if (code === "ER_DUP_ENTRY") return NextResponse.json({ message: "You have already sent a claim for this report." }, { status: 409 });
    console.error(`[claims] ${JSON.stringify({ event: "create_failed", code })}`);
    return NextResponse.json({ message: "Claims are temporarily unavailable. Please try again." }, { status: 503 });
  } finally {
    connection.release();
  }
}
