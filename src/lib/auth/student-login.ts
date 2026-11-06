import { PES_UNIVERSITY_ID } from "../registration/schema.ts";

type RosterResult = { data: { auth_email: string } | null; error: unknown | null };

export interface StudentRosterLookupClient {
  from(table: "student_roster"): {
    select(columns: "auth_email"): {
      eq(column: string, value: string): {
        eq(column: string, value: string): {
          eq(column: string, value: boolean): {
            maybeSingle(): PromiseLike<RosterResult>;
          };
        };
      };
    };
  };
}

export interface StudentAuthClient {
  auth: {
    signInWithPassword(credentials: { email: string; password: string }): Promise<{ error: unknown | null }>;
    getUser(): Promise<{ data: { user: { id: string } | null }; error: unknown | null }>;
    signOut(): Promise<unknown>;
  };
}

export type StudentLoginResult =
  | { kind: "authenticated"; userId: string }
  | { kind: "roster_lookup_failed"; cause: unknown }
  | { kind: "no_active_roster_match" }
  | { kind: "auth_credentials_rejected"; cause: unknown }
  | { kind: "session_verification_failed"; cause?: unknown; cleanupCause?: unknown };

/** Server-side only: email is read from the authorized roster and never returned. */
export async function authenticateStudentWithRoster(
  rosterClient: StudentRosterLookupClient,
  authClient: StudentAuthClient,
  srn: string,
  password: string,
): Promise<StudentLoginResult> {
  let rosterEntry: { auth_email: string } | null;
  try {
    const { data, error } = await rosterClient
      .from("student_roster")
      .select("auth_email")
      .eq("university_id", PES_UNIVERSITY_ID)
      .eq("normalized_srn", srn)
      .eq("is_active", true)
      .maybeSingle();
    if (error) return { kind: "roster_lookup_failed", cause: error };
    rosterEntry = data;
  } catch (cause) {
    return { kind: "roster_lookup_failed", cause };
  }

  if (!rosterEntry?.auth_email) return { kind: "no_active_roster_match" };

  try {
    const { error } = await authClient.auth.signInWithPassword({
      email: rosterEntry.auth_email,
      password,
    });
    if (error) return { kind: "auth_credentials_rejected", cause: error };
  } catch (cause) {
    return { kind: "auth_credentials_rejected", cause };
  }

  let verifiedUserId: string | null = null;
  let verificationCause: unknown;
  try {
    const { data, error: verificationError } = await authClient.auth.getUser();
    if (verificationError) verificationCause = verificationError;
    else verifiedUserId = data.user?.id ?? null;
  } catch (cause) {
    verificationCause = cause;
  }

  if (!verifiedUserId) {
    let cleanupCause: unknown;
    try {
      await authClient.auth.signOut();
    } catch (cause) {
      cleanupCause = cause;
    }
    return { kind: "session_verification_failed", cause: verificationCause, cleanupCause };
  }

  return { kind: "authenticated", userId: verifiedUserId };
}
