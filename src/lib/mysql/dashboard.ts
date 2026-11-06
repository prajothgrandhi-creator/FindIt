import "server-only";
import type { RowDataPacket } from "mysql2/promise";
import { listNotifications, unreadNotificationCount } from "@/lib/mysql/notifications";
import { getMysqlPool } from "@/lib/mysql/server";
import { getReportSummary, listReports } from "@/lib/mysql/reports";

export async function getDashboardSnapshot(userId: string) {
  const [reportSummary, recentReports, unreadNotifications, recentNotifications, pendingClaimRows] = await Promise.all([
    getReportSummary(userId),
    listReports({ ownerId: userId, limit: 4 }),
    unreadNotificationCount(userId),
    listNotifications(userId),
    getMysqlPool().execute<Array<RowDataPacket & { pending: number }>>(
      "SELECT COUNT(*) AS pending FROM claims WHERE report_owner_id = ? AND status = 'pending'",
      [userId],
    ),
  ]);
  return {
    reports: reportSummary,
    recentReports,
    unreadNotifications,
    recentNotifications: recentNotifications.slice(0, 4),
    pendingClaims: Number(pendingClaimRows[0][0]?.pending ?? 0),
  };
}
