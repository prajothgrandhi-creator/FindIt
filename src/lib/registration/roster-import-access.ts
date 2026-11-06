const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Compare a server-verified account identifier with a server-only allowlist.
 * Callers must derive the identifier from the authenticated server session.
 */
export function isAllowlistedRosterAdmin(
  authenticatedUserId: string | null | undefined,
  configuredAdminIds: string | undefined,
): boolean {
  return evaluateRosterAdminAccess(authenticatedUserId, configuredAdminIds) === "authorized";
}

export type RosterAdminAccessDecision =
  | "unauthenticated"
  | "allowlist_missing"
  | "allowlist_invalid"
  | "forbidden"
  | "authorized";

export function evaluateRosterAdminAccess(
  authenticatedUserId: string | null | undefined,
  configuredAdminIds: string | undefined,
): RosterAdminAccessDecision {
  if (!authenticatedUserId) return "unauthenticated";
  if (!configuredAdminIds?.trim()) return "allowlist_missing";

  const allowedIds = configuredAdminIds.split(",").map((id) => id.trim().toLowerCase());
  if (allowedIds.some((id) => !UUID_PATTERN.test(id))) return "allowlist_invalid";
  if (!UUID_PATTERN.test(authenticatedUserId)) return "forbidden";
  return allowedIds.includes(authenticatedUserId.toLowerCase()) ? "authorized" : "forbidden";
}
