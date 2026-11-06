import assert from "node:assert/strict";
import test from "node:test";
import { parseRosterCsv } from "../src/lib/registration/roster-csv.ts";
import { evaluateRosterAdminAccess, isAllowlistedRosterAdmin } from "../src/lib/registration/roster-import-access.ts";
import { loginSchema } from "../src/lib/auth/login-schema.ts";

const universityId = "7b1e4f5a-2c10-4e71-a85a-f87d4410c206";
const validHeader = "university_id,srn,auth_email";

test("parses, trims, and normalizes an approved-schema CSV row", () => {
  const result = parseRosterCsv(`\uFEFF${validHeader}\r\n ${universityId} , pes1ug00abc123 , Student@Example.edu `);
  assert.equal(result.success, true);
  if (result.success) {
    assert.deepEqual(result.rows, [{
      universityId,
      normalizedSrn: "PES1UG00ABC123",
      authEmail: "student@example.edu",
    }]);
  }
});

test("accepts supported header order and quoted CSV fields", () => {
  const result = parseRosterCsv(`auth_email,srn,university_id\n"student@example.edu",PES1UG00ABC123,${universityId}`);
  assert.equal(result.success, true);
});

test("rejects invalid university IDs, SRNs, and emails with safe codes", () => {
  const result = parseRosterCsv(`${validHeader}\nnot-a-uuid,INVALID-SRN,not-an-email`);
  assert.equal(result.success, false);
  if (!result.success) {
    assert.deepEqual(result.errors.map((error) => error.code), [
      "invalid_university_id",
      "invalid_srn",
      "invalid_auth_email",
    ]);
    assert.equal(JSON.stringify(result.errors).includes("not-an-email"), false);
    assert.equal(JSON.stringify(result.errors).includes("INVALID-SRN"), false);
  }
});

test("rejects duplicate university/SRN identities after normalization", () => {
  const result = parseRosterCsv(
    `${validHeader}\n${universityId},PES1UG00ABC123,one@example.edu\n${universityId}, pes1ug00abc123 ,two@example.edu`,
  );
  assert.equal(result.success, false);
  if (!result.success) assert.equal(result.errors.some((error) => error.code === "duplicate_student"), true);
});

test("rejects duplicate emails because the database requires email uniqueness", () => {
  const result = parseRosterCsv(
    `${validHeader}\n${universityId},PES1UG00ABC123,student@example.edu\n${universityId},PES2UG00XYZ456, STUDENT@example.edu `,
  );
  assert.equal(result.success, false);
  if (!result.success) assert.equal(result.errors.some((error) => error.code === "duplicate_email"), true);
});

test("rejects malformed rows, missing headers, and header-only files", () => {
  assert.equal(parseRosterCsv("university,srn,email\n...").success, false);
  assert.equal(parseRosterCsv(`${validHeader}\n${universityId},PES1UG00ABC123`).success, false);
  assert.equal(parseRosterCsv(validHeader).success, false);
});

test("fails closed for anonymous, invalid, and non-allowlisted identities", () => {
  const allowedId = "22222222-2222-4222-8222-222222222222";
  const otherId = "33333333-3333-4333-8333-333333333333";
  assert.equal(isAllowlistedRosterAdmin(null, allowedId), false);
  assert.equal(isAllowlistedRosterAdmin("not-a-user-id", allowedId), false);
  assert.equal(isAllowlistedRosterAdmin(otherId, allowedId), false);
  assert.equal(isAllowlistedRosterAdmin(allowedId, undefined), false);
  assert.equal(isAllowlistedRosterAdmin(allowedId, ` ${allowedId.toUpperCase()} `), true);
});

test("distinguishes missing and malformed administrator allowlists", () => {
  const userId = "22222222-2222-4222-8222-222222222222";
  assert.equal(evaluateRosterAdminAccess(userId, undefined), "allowlist_missing");
  assert.equal(evaluateRosterAdminAccess(userId, ""), "allowlist_missing");
  assert.equal(evaluateRosterAdminAccess(userId, "not-a-uuid"), "allowlist_invalid");
  assert.equal(evaluateRosterAdminAccess(null, undefined), "unauthenticated");
});

test("normalizes and validates student SRN and password without accepting email", () => {
  const valid = loginSchema.safeParse({ srn: "  pes1ug00abc123 ", password: "secure-test-pass" });
  assert.equal(valid.success, true);
  if (valid.success) assert.deepEqual(valid.data, { srn: "PES1UG00ABC123", password: "secure-test-pass" });

  const invalid = loginSchema.safeParse({ srn: "private-student@example.edu", password: "" });
  assert.equal(invalid.success, false);
  if (!invalid.success) {
    const errors = JSON.stringify(invalid.error.issues.map(({ path, code }) => ({ path, code })));
    assert.equal(errors.includes("private-student@example.edu"), false);
  }
});
