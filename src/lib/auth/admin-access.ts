import "server-only";
import { PES_SRN_PATTERN } from "@/lib/registration/schema";

export function isConfiguredRosterAdmin(srn: string, configured = process.env.MONGODB_ADMIN_SRNS) {
  if (!configured?.trim() || !PES_SRN_PATTERN.test(srn)) return false;
  const allowed = configured.split(",").map((value) => value.trim().toUpperCase());
  return allowed.every((value) => PES_SRN_PATTERN.test(value)) && allowed.includes(srn.toUpperCase());
}
