"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PES_UNIVERSITY_ID } from "@/lib/registration/schema";
import { loginSchema } from "@/lib/auth/login-schema";
import { verifyPassword } from "@/lib/auth/password";
import { createStudentSession, destroyCurrentStudentSession, type StudentProfile } from "@/lib/auth/session";
import { getDatabase } from "@/lib/mongodb/server";

export type LoginActionState = { error?: string };

const GENERIC_LOGIN_ERROR = "We couldn't sign you in. Check your SRN and password, then try again.";
const TEMPORARY_LOGIN_ERROR = "Sign-in is temporarily unavailable. Please try again later.";

export async function loginAction(_previousState: LoginActionState, formData: FormData): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse({ srn: formData.get("srn"), password: formData.get("password") });
  if (!parsed.success) return { error: "Enter a valid SRN and password." };

  let profile: StudentProfile | null;
  try {
    const db = await getDatabase();
    profile = await db.collection<StudentProfile>("student_profiles").findOne({
      universityId: PES_UNIVERSITY_ID,
      normalizedSrn: parsed.data.srn,
    });
    if (!profile || profile.verificationStatus === "disabled" || !(await verifyPassword(parsed.data.password, profile.passwordHash))) {
      return { error: GENERIC_LOGIN_ERROR };
    }
    await createStudentSession(profile._id);
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error
      && typeof error.code === "string" && /^[A-Za-z0-9_-]{1,32}$/.test(error.code)
      ? error.code
      : undefined;
    console.error(`[auth] ${JSON.stringify({ event: "login_failed", ...(code ? { code } : {}) })}`);
    return { error: TEMPORARY_LOGIN_ERROR };
  }

  revalidatePath("/", "layout");
  redirect(profile.role === "admin" ? "/admin" : "/dashboard");
}

export async function signOutAction() {
  try {
    await destroyCurrentStudentSession();
  } catch {
    console.error("[auth] {\"event\":\"session_cleanup_failed\"}");
  }
  revalidatePath("/", "layout");
  redirect("/login");
}
