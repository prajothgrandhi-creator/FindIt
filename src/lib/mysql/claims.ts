import "server-only";
import type { RowDataPacket } from "mysql2/promise";
import { getMysqlPool } from "@/lib/mysql/server";

export type ClaimRow = RowDataPacket & {
  id: string;
  report_id: string;
  report_owner_id: string;
  claimant_id: string;
  claimant_name: string;
  message: string;
  status: "pending" | "accepted" | "declined";
  created_at: Date | string;
  updated_at: Date | string;
  item_name: string;
  report_type: "lost" | "found";
};

export async function listClaimsForUser(userId: string) {
  const [rows] = await getMysqlPool().execute<ClaimRow[]>(
    "SELECT c.id, c.report_id, c.report_owner_id, c.claimant_id, c.claimant_name, c.message, c.status, c.created_at, c.updated_at, r.item_name, r.type AS report_type FROM claims c JOIN reports r ON r.id = c.report_id WHERE c.report_owner_id = ? OR c.claimant_id = ? ORDER BY c.created_at DESC LIMIT 100",
    [userId, userId],
  );
  return rows;
}
