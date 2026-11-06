import "server-only";
import { getCurrentStudentSession } from "@/lib/auth/session";
import { isConfiguredRosterAdmin } from "@/lib/auth/admin-access";

export async function getRosterAdminContext() {
  let current: Awaited<ReturnType<typeof getCurrentStudentSession>>;
  try {
    current = await getCurrentStudentSession();
  } catch {
    return { kind: "auth_unavailable" as const };
  }
  if (!current) return { kind: "unauthenticated" as const };
  if (!process.env.MONGODB_ADMIN_SRNS?.trim()) return { kind: "allowlist_missing" as const };
  if (!isConfiguredRosterAdmin(current.profile.normalizedSrn)) return { kind: "forbidden" as const };
  if (current.profile.verificationStatus !== "verified" || current.profile.role !== "admin") {
    return { kind: "forbidden" as const };
  }
  return { kind: "authorized" as const, profileId: current.profile._id };
}
