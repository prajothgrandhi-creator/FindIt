import assert from "node:assert/strict";
import test from "node:test";
import { registrationSchema, PES_UNIVERSITY_ID } from "../src/lib/registration/schema.ts";

const validInput = {
  universityId: PES_UNIVERSITY_ID,
  email: "student@example.edu",
  srn: "PES1UG00ABC123",
  fullName: "Sample Student",
  password: "campus-pass-8",
};

test("valid registration trims the name and normalizes SRN", () => {
  const result = registrationSchema.safeParse({
    ...validInput,
    srn: "  pes1ug00abc123  ",
    fullName: "  Sample Student  ",
  });

  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.srn, "PES1UG00ABC123");
    assert.equal(result.data.fullName, "Sample Student");
  }
});

test("empty form submission is rejected", () => {
  assert.equal(registrationSchema.safeParse({}).success, false);
});

test("registration requires a valid email and normalizes it", () => {
  assert.equal(registrationSchema.safeParse({ ...validInput, email: undefined }).success, false);
  assert.equal(registrationSchema.safeParse({ ...validInput, email: "   " }).success, false);
  const result = registrationSchema.safeParse({ ...validInput, email: " Student@Example.EDU " });
  assert.equal(result.success, true);
  if (result.success) assert.equal(result.data.email, "student@example.edu");
});

test("missing and unsupported universities are rejected", () => {
  assert.equal(registrationSchema.safeParse({ ...validInput, universityId: "" }).success, false);
  assert.equal(registrationSchema.safeParse({ ...validInput, universityId: "6e94aa64-85f4-4eca-9376-f1993d049cf8" }).success, false);
});

test("empty or malformed SRNs are rejected by the configured pattern", () => {
  assert.equal(registrationSchema.safeParse({ ...validInput, srn: "  " }).success, false);
  assert.equal(registrationSchema.safeParse({ ...validInput, srn: "PES1UG00ABC12" }).success, false);
  assert.equal(registrationSchema.safeParse({ ...validInput, srn: "P".repeat(21) }).success, false);
});

test("empty and overlong names are rejected without restricting ordinary names", () => {
  assert.equal(registrationSchema.safeParse({ ...validInput, fullName: "   " }).success, false);
  assert.equal(registrationSchema.safeParse({ ...validInput, fullName: "A" }).success, true);
  assert.equal(registrationSchema.safeParse({ ...validInput, fullName: "N".repeat(101) }).success, false);
});

test("password is required and length-limited without extra composition rules", () => {
  assert.equal(registrationSchema.safeParse({ ...validInput, password: "" }).success, false);
  assert.equal(registrationSchema.safeParse({ ...validInput, password: "1234567" }).success, false);
  assert.equal(registrationSchema.safeParse({ ...validInput, password: "12345678" }).success, true);
  assert.equal(registrationSchema.safeParse({ ...validInput, password: "x".repeat(73) }).success, false);
});
