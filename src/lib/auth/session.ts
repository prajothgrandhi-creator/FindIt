import "server-only";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";
import type { Collection } from "mongodb";
import { getDatabase } from "@/lib/mongodb/server";
import type { SessionDocument, StudentProfileDocument } from "@/lib/mongodb/types";

const SESSION_COOKIE = "findit_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14;

export type StudentProfile = StudentProfileDocument;

function digest(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function sessionCollection() {
  return getDatabase().then((db) => db.collection<SessionDocument>("sessions"));
}

export async function createStudentSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);
  const sessions = await sessionCollection();
  await sessions.insertOne({ _id: randomUUID(), tokenHash: digest(token), userId, expiresAt, createdAt: new Date() });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function getCurrentStudentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  await connection();
  const db = await getDatabase();
  const session = await db.collection<SessionDocument>("sessions").findOne({
    tokenHash: digest(token),
    expiresAt: { $gt: new Date() },
  });
  if (!session) return null;
  const profile = await db.collection<StudentProfile>("student_profiles").findOne({ _id: session.userId });
  if (!profile || profile.verificationStatus === "disabled") return null;
  return { profile, sessionId: session._id };
}

export async function destroyCurrentStudentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  try {
    if (token) {
      const sessions: Collection<SessionDocument> = await sessionCollection();
      await sessions.deleteOne({ tokenHash: digest(token) });
    }
  } finally {
    cookieStore.delete(SESSION_COOKIE);
  }
}
