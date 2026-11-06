import assert from "node:assert/strict";
import test from "node:test";
import { loginSchema } from "../src/lib/auth/login-schema.ts";
import { authenticateStudentWithRoster } from "../src/lib/auth/student-login.ts";
import { PES_UNIVERSITY_ID } from "../src/lib/registration/schema.ts";

const srn = "PES1UG00ABC123";
const privateRosterEmail = "approved-student@example.edu";

function mockRoster({ data = { auth_email: privateRosterEmail }, error = null } = {}) {
  const filters = [];
  const query = {
    eq(column, value) {
      filters.push([column, value]);
      return this;
    },
    async maybeSingle() { return { data, error }; },
  };
  return {
    filters,
    client: {
      from(table) {
        assert.equal(table, "student_roster");
        return { select(columns) { assert.equal(columns, "auth_email"); return query; } };
      },
    },
  };
}

function mockAuth({ signInError = null, user = { id: "22222222-2222-4222-8222-222222222222" }, verificationError = null } = {}) {
  const calls = { credentials: null, signOut: 0 };
  return {
    calls,
    client: {
      auth: {
        async signInWithPassword(credentials) { calls.credentials = credentials; return { error: signInError }; },
        async getUser() { return { data: { user }, error: verificationError }; },
        async signOut() { calls.signOut += 1; },
      },
    },
  };
}

test("login schema trims and uppercases a valid SRN, and rejects invalid SRNs", () => {
  const parsed = loginSchema.safeParse({ srn: " pes1ug00abc123 ", password: "password-123" });
  assert.equal(parsed.success, true);
  if (parsed.success) assert.deepEqual(parsed.data, { srn, password: "password-123" });
  assert.equal(loginSchema.safeParse({ srn: "not-an-srn", password: "password-123" }).success, false);
  assert.equal(loginSchema.safeParse({ srn, password: "" }).success, false);
});

test("roster query is restricted to supported university, normalized SRN, and active rows", async () => {
  const roster = mockRoster();
  const auth = mockAuth();
  const parsed = loginSchema.parse({ srn: " pes1ug00abc123 ", password: "password-123" });
  const result = await authenticateStudentWithRoster(roster.client, auth.client, parsed.srn, parsed.password);
  assert.deepEqual(roster.filters, [
    ["university_id", PES_UNIVERSITY_ID],
    ["normalized_srn", srn],
    ["is_active", true],
  ]);
  assert.equal(result.kind, "authenticated");
  assert.equal("email" in result, false);
  assert.equal(auth.calls.credentials.email, privateRosterEmail);
  assert.equal(auth.calls.credentials.password, "password-123");
});

test("roster lookup errors are distinguished from an empty active roster match", async () => {
  const failedRoster = mockRoster({ error: { code: "XX000" }, data: null });
  const failedAuth = mockAuth();
  const failure = await authenticateStudentWithRoster(failedRoster.client, failedAuth.client, srn, "password-123");
  assert.equal(failure.kind, "roster_lookup_failed");
  assert.equal(failedAuth.calls.credentials, null);

  const emptyRoster = mockRoster({ data: null });
  const emptyAuth = mockAuth();
  const noMatch = await authenticateStudentWithRoster(emptyRoster.client, emptyAuth.client, srn, "password-123");
  assert.deepEqual(noMatch, { kind: "no_active_roster_match" });
  assert.equal(emptyAuth.calls.credentials, null);
});

test("incorrect password returns a generic internal rejection and does not disclose roster email", async () => {
  const roster = mockRoster();
  const auth = mockAuth({ signInError: { code: "invalid_credentials", message: "Invalid login credentials" } });
  const result = await authenticateStudentWithRoster(roster.client, auth.client, srn, "wrong-password");
  assert.equal(result.kind, "auth_credentials_rejected");
  assert.equal(JSON.stringify(result).includes(privateRosterEmail), false);
  assert.equal(auth.calls.credentials.email, privateRosterEmail);
});

test("successful sign-in verifies user and returns only the user ID", async () => {
  const roster = mockRoster();
  const auth = mockAuth();
  const result = await authenticateStudentWithRoster(roster.client, auth.client, srn, "password-123");
  assert.deepEqual(result, { kind: "authenticated", userId: "22222222-2222-4222-8222-222222222222" });
  assert.equal(JSON.stringify(result).includes(privateRosterEmail), false);
});

test("unverified Auth session is signed out and rejected", async () => {
  const roster = mockRoster();
  const auth = mockAuth({ user: null, verificationError: { code: "auth_error" } });
  const result = await authenticateStudentWithRoster(roster.client, auth.client, srn, "password-123");
  assert.equal(result.kind, "session_verification_failed");
  assert.equal(auth.calls.signOut, 1);
});
