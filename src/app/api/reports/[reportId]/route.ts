import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentStudentSession } from "@/lib/auth/session";
import { setReportStatus } from "@/lib/mysql/reports";

const statusSchema = z.object({ status: z.enum(["open", "resolved", "closed"]) }).strict();

export async function PATCH(request: Request, context: { params: Promise<{ reportId: string }> }) {
  const current = await getCurrentStudentSession();
  if (!current) return NextResponse.json({ message: "Sign in to update a report." }, { status: 401 });
  const { reportId } = await context.params;
  if (!z.string().uuid().safeParse(reportId).success) return NextResponse.json({ message: "Report not found." }, { status: 404 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Review the update and try again." }, { status: 400 }); }
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "Choose a valid report status." }, { status: 400 });

  try {
    const updated = await setReportStatus(reportId, current.profile._id, parsed.data.status);
    if (!updated) return NextResponse.json({ message: "Report not found or no longer available." }, { status: 404 });
    return NextResponse.json({ message: "Report status updated." });
  } catch {
    console.error("[reports] {\"event\":\"status_update_failed\"}");
    return NextResponse.json({ message: "Report updates are temporarily unavailable." }, { status: 503 });
  }
}
