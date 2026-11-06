export const GENERIC_REGISTRATION_ACCEPTANCE_MESSAGE =
  "If your details match an active campus record, your account request has been received. You can sign in after registration; student access remains pending until campus approval.";

export type RosterRegistrationGate<T> =
  | { kind: "no_match"; status: 202; message: string }
  | { kind: "matched"; value: T };

export type ExistingProfileGate<T> =
  | { kind: "already_registered"; status: 202; message: string }
  | { kind: "proceed"; value: T };

export function matchesRosterEmail(submittedEmail: string, authorizedEmail: string): boolean {
  return submittedEmail.trim().toLowerCase() === authorizedEmail.trim().toLowerCase();
}

/** Run account/profile creation only after the active roster query returned its private email. */
export async function runAfterActiveRosterMatch<T>(
  rosterEntry: { auth_email: string } | null | undefined,
  operation: (authorizedEmail: string) => Promise<T>,
): Promise<RosterRegistrationGate<T>> {
  if (!rosterEntry?.auth_email) {
    return { kind: "no_match", status: 202, message: GENERIC_REGISTRATION_ACCEPTANCE_MESSAGE };
  }
  return { kind: "matched", value: await operation(rosterEntry.auth_email) };
}

/** Avoid retrying a profile insert for an SRN that already has an account. */
export async function runAfterNoExistingProfile<T>(
  profileExists: boolean,
  operation: () => Promise<T>,
): Promise<ExistingProfileGate<T>> {
  if (profileExists) {
    return { kind: "already_registered", status: 202, message: GENERIC_REGISTRATION_ACCEPTANCE_MESSAGE };
  }
  return { kind: "proceed", value: await operation() };
}
