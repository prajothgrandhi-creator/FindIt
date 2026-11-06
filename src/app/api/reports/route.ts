import "server-only";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getCurrentStudentSession } from "@/lib/auth/session";
import { getMysqlPool } from "@/lib/mysql/server";
import { reportDraftSchema } from "@/lib/reports/draft-schema";

const IMAGE_LIMIT = 5 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  const current = await getCurrentStudentSession();
  if (!current) return NextResponse.json({ message: "Sign in to submit a report." }, { status: 401 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ message: "The report could not be read. Review the form and try again." }, { status: 400 });
  }
  const parsed = reportDraftSchema.safeParse({
    type: form.get("type"),
    itemName: form.get("itemName"),
    description: form.get("description"),
    location: form.get("location"),
    occurredAt: form.get("occurredAt"),
  });
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Review the report fields." }, { status: 400 });
  }
  const relatedLostIdValue = form.get("relatedLostId");
  const relatedLostId = typeof relatedLostIdValue === "string" && relatedLostIdValue ? relatedLostIdValue : null;
  if (relatedLostId && (parsed.data.type !== "found" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(relatedLostId))) {
    return NextResponse.json({ message: "This found report link is invalid. Start from the lost report and try again." }, { status: 400 });
  }

  let imageBytes: Buffer | null = null;
  let imageMime: string | null = null;
  const image = form.get("image");
  if (image instanceof File && image.size > 0) {
    if (!IMAGE_TYPES.has(image.type)) return NextResponse.json({ message: "Choose a JPG, PNG, or WebP image." }, { status: 415 });
    if (image.size > IMAGE_LIMIT) return NextResponse.json({ message: "Choose an image smaller than 5 MB." }, { status: 413 });
    imageBytes = Buffer.from(await image.arrayBuffer());
    imageMime = image.type;
  }

  const id = randomUUID();
  const occurredAt = parsed.data.occurredAt ? `${parsed.data.occurredAt.replace("T", " ")}:00.000` : null;
  try {
    const connection = await getMysqlPool().getConnection();
    try {
      await connection.beginTransaction();
      if (relatedLostId) {
        const [lostRows] = await connection.execute<import("mysql2/promise").RowDataPacket[]>("SELECT id, owner_id, item_name, type, status FROM reports WHERE id = ? LIMIT 1 FOR UPDATE", [relatedLostId]);
        const lostReport = lostRows[0] as { id: string; owner_id: string; item_name: string; type: string; status: string } | undefined;
        if (!lostReport || lostReport.type !== "lost" || lostReport.status !== "open") {
          await connection.rollback();
          return NextResponse.json({ message: "The linked lost report is no longer open." }, { status: 404 });
        }
        if (lostReport.owner_id === current.profile._id) {
          await connection.rollback();
          return NextResponse.json({ message: "You cannot respond to your own lost report." }, { status: 400 });
        }
        const [existingRows] = await connection.execute<import("mysql2/promise").RowDataPacket[]>("SELECT id FROM found_responses WHERE lost_report_id = ? AND finder_id = ? LIMIT 1", [relatedLostId, current.profile._id]);
        if (existingRows.length) {
          await connection.rollback();
          return NextResponse.json({ message: "You already reported finding an item for this lost report." }, { status: 409 });
        }
        await connection.execute(
          "INSERT INTO reports (id, owner_id, type, item_name, description, location, occurred_at, image_data, image_mime, status) VALUES (?, ?, 'found', ?, ?, ?, ?, ?, ?, 'open')",
          [id, current.profile._id, parsed.data.itemName, parsed.data.description, parsed.data.location, occurredAt, imageBytes, imageMime],
        );
        await connection.execute("INSERT INTO found_responses (id, lost_report_id, found_report_id, finder_id) VALUES (?, ?, ?, ?)", [randomUUID(), relatedLostId, id, current.profile._id]);
        await connection.execute(
          "INSERT INTO notifications (id, user_id, kind, title, body, href) VALUES (?, ?, 'found_response', ?, ?, '/my-reports')",
          [randomUUID(), lostReport.owner_id, "A student reported finding an item", `A found report was linked to your ${lostReport.item_name} report.`],
        );
      } else {
        await connection.execute(
          "INSERT INTO reports (id, owner_id, type, item_name, description, location, occurred_at, image_data, image_mime, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')",
          [id, current.profile._id, parsed.data.type, parsed.data.itemName, parsed.data.description, parsed.data.location, occurredAt, imageBytes, imageMime],
        );
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback().catch(() => {});
      throw error;
    } finally { connection.release(); }
    return NextResponse.json({ id, message: "Your report has been published." }, { status: 201 });
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error && typeof error.code === "string"
      ? error.code
      : "REPORT_CREATE_FAILED";
    console.error(`[reports] ${JSON.stringify({ event: "create_failed", code })}`);
    return NextResponse.json({ message: "Report submission is temporarily unavailable. Please try again." }, { status: 503 });
  }
}
