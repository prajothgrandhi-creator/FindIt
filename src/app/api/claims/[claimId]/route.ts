import "server-only";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentStudentSession } from "@/lib/auth/session";
import { getMysqlPool } from "@/lib/mysql/server";

const statusSchema = z.object({ status: z.enum(["accepted", "declined"]) }).strict();

export async function PATCH(request: Request, context: { params: Promise<{ claimId: string }> }) {
  const current = await getCurrentStudentSession();
  if (!current) return NextResponse.json({ message: "Sign in to update a claim." }, { status: 401 });
  const { claimId } = await context.params;
  if (!z.string().uuid().safeParse(claimId).success) return NextResponse.json({ message: "Claim not found." }, { status: 404 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Review the update and try again." }, { status: 400 }); }
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "Choose accept or decline." }, { status: 400 });

  const pool = getMysqlPool();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.execute<import("mysql2/promise").ResultSetHeader>(
      "UPDATE claims SET status = ?, updated_at = UTC_TIMESTAMP(3) WHERE id = ? AND report_owner_id = ? AND status = 'pending'",
      [parsed.data.status, claimId, current.profile._id],
    );
    if (result.affectedRows !== 1) {
      await connection.rollback();
      return NextResponse.json({ message: "Claim not found or already reviewed." }, { status: 404 });
    }
    const [rows] = await connection.execute<Array<import("mysql2/promise").RowDataPacket & { item_name: string; claimant_id: string }>>(
      "SELECT r.item_name, c.claimant_id FROM claims c JOIN reports r ON r.id = c.report_id WHERE c.id = ? LIMIT 1",
      [claimId],
    );
    const claim = rows[0];
    if (!claim) throw new Error("claim_not_found_after_update");
    const verb = parsed.data.status === "accepted" ? "accepted" : "declined";
    await connection.execute(
      "INSERT INTO notifications (id, user_id, kind, title, body, href) VALUES (?, ?, 'claim_reviewed', ?, ?, '/claims')",
      [randomUUID(), claim.claimant_id, `Your claim was ${verb}`, `The report owner ${verb} your claim for ${claim.item_name}.`],
    );
    await connection.commit();
    return NextResponse.json({ message: `Claim ${verb}.` });
  } catch (error) {
    await connection.rollback().catch(() => {});
    const code = error && typeof error === "object" && "code" in error && typeof error.code === "string" ? error.code : "CLAIM_UPDATE_FAILED";
    console.error(`[claims] ${JSON.stringify({ event: "update_failed", code })}`);
    return NextResponse.json({ message: "Claims are temporarily unavailable. Please try again." }, { status: 503 });
  } finally {
    connection.release();
  }
}
