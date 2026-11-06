import assert from "node:assert/strict";
import test from "node:test";
import { matchesRosterEmail, runAfterActiveRosterMatch, runAfterNoExistingProfile } from "../src/lib/registration/roster-registration-gate.ts";

test("signup email must match the roster address after case and whitespace normalization", () => {
  assert.equal(matchesRosterEmail(" Student@Example.EDU ", "student@example.edu"), true);
  assert.equal(matchesRosterEmail("other@example.edu", "student@example.edu"), false);
});

test("empty roster returns generic HTTP 202 outcome without creating Auth or profile records", async () => {
  const sideEffects = { authUsers: 0, profiles: 0 };
  const outcome = await runAfterActiveRosterMatch(null, async () => {
    sideEffects.authUsers += 1;
    sideEffects.profiles += 1;
  });

  assert.equal(outcome.kind, "no_match");
  assert.equal(outcome.status, 202);
  assert.match(outcome.message, /active campus record/);
  assert.match(outcome.message, /does not confirm account creation or enrollment/);
  assert.deepEqual(sideEffects, { authUsers: 0, profiles: 0 });
});

test("missing roster email is treated as no match", async () => {
  let attempted = false;
  const outcome = await runAfterActiveRosterMatch({ auth_email: "" }, async () => {
    attempted = true;
  });
  assert.equal(outcome.kind, "no_match");
  assert.equal(attempted, false);
});

test("matched roster email is only passed to the gated server operation", async () => {
  const outcome = await runAfterActiveRosterMatch({ auth_email: "approved@example.edu" }, async (email) => `used:${email}`);
  assert.deepEqual(outcome, { kind: "matched", value: "used:approved@example.edu" });
});

test("existing profile returns generic 202 without retrying Auth or profile creation", async () => {
  const sideEffects = { authSignups: 0, profileInserts: 0 };
  const outcome = await runAfterNoExistingProfile(true, async () => {
    sideEffects.authSignups += 1;
    sideEffects.profileInserts += 1;
  });

  assert.equal(outcome.kind, "already_registered");
  assert.equal(outcome.status, 202);
  assert.match(outcome.message, /does not confirm account creation or enrollment/);
  assert.deepEqual(sideEffects, { authSignups: 0, profileInserts: 0 });
});
