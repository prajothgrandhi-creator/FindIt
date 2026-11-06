import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentStudentSession } from "@/lib/auth/session";
import { markNotificationsRead } from "@/lib/mysql/notifications";

const schema = z.object({ ids: z.array(z.string().uuid()).max(100).optional() }).strict();

export async function POST(request: Request) {
  const current = await getCurrentStudentSession();
  if (!current) return NextResponse.json({ message: "Sign in to update notifications." }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Review the notification update." }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "Choose valid notifications." }, { status: 400 });
  try {
    const updatedCount = await markNotificationsRead(current.profile._id, parsed.data.ids);
    return NextResponse.json({ updatedCount });
  } catch {
    console.error("[notifications] {\"event\":\"mark_read_failed\"}");
    return NextResponse.json({ message: "Notifications are temporarily unavailable." }, { status: 503 });
  }
}
