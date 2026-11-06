import "server-only";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import { z } from "zod";
import { getCurrentStudentSession } from "@/lib/auth/session";
import { getMysqlPool } from "@/lib/mysql/server";

const schema = z.object({ lostReportId: z.string().uuid() }).strict();
type LostReportRow = RowDataPacket & { id: string; owner_id: string; item_name: string; description: string; type: string; status: string };
type FoundReportRow = RowDataPacket & { id: string; item_name: string; description: string };

function normalizedItemName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

export async function POST(request: Request) {
  const current = await getCurrentStudentSession();
  if (!current) return NextResponse.json({ message: "Sign in to respond to a lost report." }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Review the report and try again." }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "The lost report could not be identified." }, { status: 400 });

  const connection = await getMysqlPool().getConnection();
  try {
    await connection.beginTransaction();
    const [lostRows] = await connection.execute<LostReportRow[]>("SELECT id, owner_id, item_name, description, type, status FROM reports WHERE id = ? LIMIT 1 FOR UPDATE", [parsed.data.lostReportId]);
    const lostReport = lostRows[0];
    if (!lostReport || lostReport.type !== "lost" || lostReport.status !== "open") {
      await connection.rollback();
      return NextResponse.json({ message: "This lost report is no longer open." }, { status: 404 });
    }
    if (lostReport.owner_id === current.profile._id) {
      await connection.rollback();
      return NextResponse.json({ message: "You cannot respond to your own lost report." }, { status: 400 });
    }

    const [priorResponses] = await connection.execute<RowDataPacket[]>("SELECT id FROM found_responses WHERE lost_report_id = ? AND finder_id = ? LIMIT 1", [lostReport.id, current.profile._id]);
    if (priorResponses.length) {
      await connection.rollback();
      return NextResponse.json({ message: "Your found report is already linked to this lost report." }, { status: 200 });
    }

    const [foundRows] = await connection.execute<FoundReportRow[]>(
      "SELECT id, item_name, description FROM reports WHERE owner_id = ? AND type = 'found' AND status = 'open' ORDER BY created_at DESC LIMIT 100",
      [current.profile._id],
    );
    const lostName = normalizedItemName(lostReport.item_name);
    const lostSearchTerms = new Set(normalizedItemName(`${lostReport.item_name} ${lostReport.description ?? ""}`).split(" ").filter((term) => term.length > 2));
    const foundReport = foundRows.find((report) => normalizedItemName(report.item_name) === lostName)
      ?? foundRows.find((report) => normalizedItemName(`${report.item_name} ${report.description}`).split(" ").some((term) => lostSearchTerms.has(term) && term.length > 2));
    const foundReportId = foundReport?.id ?? randomUUID();

    if (!foundReport) {
      await connection.execute(
        "INSERT INTO reports (id, owner_id, type, item_name, description, location, occurred_at, image_data, image_mime, status) VALUES (?, ?, 'found', ?, '', '', NULL, NULL, NULL, 'open')",
        [foundReportId, current.profile._id, lostReport.item_name],
      );
    }

    await connection.execute("INSERT INTO found_responses (id, lost_report_id, found_report_id, finder_id) VALUES (?, ?, ?, ?)", [randomUUID(), lostReport.id, foundReportId, current.profile._id]);
    await connection.execute(
      "INSERT INTO notifications (id, user_id, kind, title, body, href) VALUES (?, ?, 'found_response', ?, ?, '/my-reports')",
      [randomUUID(), lostReport.owner_id, "A student reported finding an item", `An existing found report was linked to your ${lostReport.item_name} report.`],
    );
    await connection.commit();
    return NextResponse.json({ message: foundReport ? "Your existing found report was linked and the owner was notified." : "Your found report was created and linked. The owner was notified." }, { status: 201 });
  } catch (error) {
    await connection.rollback().catch(() => {});
    const code = error && typeof error === "object" && "code" in error && typeof error.code === "string" ? error.code : "FOUND_RESPONSE_FAILED";
    if (code === "ER_DUP_ENTRY") return NextResponse.json({ message: "Your found report is already linked to this lost report." }, { status: 409 });
    console.error(`[found-responses] ${JSON.stringify({ event: "create_failed", code })}`);
    return NextResponse.json({ message: "Found item responses are temporarily unavailable." }, { status: 503 });
  } finally {
    connection.release();
  }
}
