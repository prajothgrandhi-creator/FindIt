import assert from "node:assert/strict";
import test from "node:test";
import { reportDraftSchema } from "../src/lib/reports/draft-schema.ts";

const validDraft = {
  type: "lost",
  itemName: "  Black water bottle  ",
  description: "  Steel bottle with a plain cover.  ",
  location: "  Library, second floor  ",
  occurredAt: "2026-11-01T14:30",
};

test("report draft accepts Lost and Found and trims text fields", () => {
  for (const type of ["lost", "found"]) {
    const parsed = reportDraftSchema.parse({ ...validDraft, type });
    assert.equal(parsed.type, type);
    assert.equal(parsed.itemName, "Black water bottle");
    assert.equal(parsed.description, "Steel bottle with a plain cover.");
    assert.equal(parsed.location, "Library, second floor");
  }
});

test("report draft rejects unsupported types and a missing item name", () => {
  assert.equal(reportDraftSchema.safeParse({ ...validDraft, type: "claim" }).success, false);
  assert.equal(reportDraftSchema.safeParse({ ...validDraft, itemName: "   " }).success, false);
  assert.equal(reportDraftSchema.safeParse({ ...validDraft, itemName: "x".repeat(121) }).success, false);
});

test("report draft bounds optional detail fields and rejects invalid local times", () => {
  assert.equal(reportDraftSchema.safeParse({ ...validDraft, description: "x".repeat(1001) }).success, false);
  assert.equal(reportDraftSchema.safeParse({ ...validDraft, location: "x".repeat(161) }).success, false);
  assert.equal(reportDraftSchema.safeParse({ ...validDraft, occurredAt: "2026-02-30T12:00" }).success, false);
  assert.equal(reportDraftSchema.safeParse({ ...validDraft, occurredAt: "" }).success, true);
});

test("report draft rejects client-supplied ownership or unsupported extra fields", () => {
  assert.equal(reportDraftSchema.safeParse({ ...validDraft, userId: "attacker-controlled" }).success, false);
});
