"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentStudentSession } from "@/lib/auth/session";
import { getDatabase } from "@/lib/mongodb/server";
import type { StudentProfileDocument } from "@/lib/mongodb/types";

export type ProfileActionState = { error?: string; success?: string };

const profileSchema = z.object({
  displayName: z.string().trim().min(1, "Enter your full name.").max(100, "Name must be 100 characters or fewer."),
  email: z.string().trim().min(1, "Enter your email address.").max(254, "Email address must be 254 characters or fewer.").email("Enter a valid email address.").transform((value) => value.toLowerCase()),
}).strict();

export async function updateProfileAction(_state: ProfileActionState, formData: FormData): Promise<ProfileActionState> {
  const current = await getCurrentStudentSession();
  if (!current) return { error: "Your session expired. Sign in again to update your profile." };

  const parsed = profileSchema.safeParse({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the profile fields and try again." };

  try {
    const db = await getDatabase();
    const result = await db.collection<StudentProfileDocument>("student_profiles").updateOne(
      { _id: current.profile._id },
      { $set: { displayName: parsed.data.displayName, email: parsed.data.email, updatedAt: new Date() } },
    );
    if (result.matchedCount !== 1) return { error: "Your profile could not be found. Sign in again and retry." };
  } catch {
    console.error("[profile] {\"event\":\"profile_update_failed\"}");
    return { error: "Profile updates are temporarily unavailable. Please try again." };
  }

  revalidatePath("/settings");
  revalidatePath("/", "layout");
  return { success: "Your profile has been updated." };
}
