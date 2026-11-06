import "server-only";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { PES_UNIVERSITY_ID, registrationSchema } from "@/lib/registration/schema";
import { isConfiguredRosterAdmin } from "@/lib/auth/admin-access";
import { hashPassword } from "@/lib/auth/password";
import { getDatabase } from "@/lib/mongodb/server";
import type { StudentProfileDocument, UniversityDocument } from "@/lib/mongodb/types";

const ACCOUNT_CREATED_MESSAGE = "Your FindIt account has been created. Sign in with your SRN and password; student features remain pending campus approval.";
const DUPLICATE_ACCOUNT_MESSAGE = "We couldn't create this account. If you've already registered, sign in or contact the Help Center.";
const TEMPORARY_ERROR_MESSAGE = "Registration is temporarily unavailable. Please try again later.";

function logFailure(event: string, error: unknown) {
  const candidate = error && typeof error === "object" ? error as { code?: unknown } : {};
  const code = typeof candidate.code === "string" && /^[A-Za-z0-9_-]{1,32}$/.test(candidate.code)
    ? candidate.code
    : undefined;
  console.error(`[registration] ${JSON.stringify({ event, ...(code ? { code } : {}) })}`);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Please review the form and try again." }, { status: 400 });
  }

  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && !fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return NextResponse.json({ message: "Please review the highlighted fields.", fieldErrors }, { status: 400 });
  }

  try {
    const db = await getDatabase();
    const university = await db.collection<UniversityDocument>("universities").findOne({
      _id: parsed.data.universityId,
      isActive: true,
    });
    if (!university || String(university._id) !== PES_UNIVERSITY_ID) {
      return NextResponse.json({ message: "Please select an active university." }, { status: 400 });
    }

    const profiles = db.collection<StudentProfileDocument>("student_profiles");
    const existing = await profiles.findOne({ universityId: parsed.data.universityId, normalizedSrn: parsed.data.srn });
    if (existing) return NextResponse.json({ message: DUPLICATE_ACCOUNT_MESSAGE }, { status: 409 });

    const isAdmin = isConfiguredRosterAdmin(parsed.data.srn);
    const now = new Date();
    await profiles.insertOne({
      _id: randomUUID(),
      universityId: parsed.data.universityId,
      normalizedSrn: parsed.data.srn,
      displayName: parsed.data.fullName,
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password),
      verificationStatus: "verified",
      role: isAdmin ? "admin" : "student",
      createdAt: now,
      updatedAt: now,
    });
    console.info("[registration] {\"event\":\"request_processed\"}");
    return NextResponse.json({ message: ACCOUNT_CREATED_MESSAGE }, { status: 201 });
  } catch (error) {
    const candidate = error && typeof error === "object" ? error as { code?: unknown } : {};
    if (candidate.code === 11000) {
      return NextResponse.json({ message: DUPLICATE_ACCOUNT_MESSAGE }, { status: 409 });
    }
    logFailure("database_or_registration_failed", error);
    return NextResponse.json({ message: TEMPORARY_ERROR_MESSAGE }, { status: 503 });
  }
}
