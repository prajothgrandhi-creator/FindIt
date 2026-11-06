import "server-only";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { getMysqlPool } from "@/lib/mysql/server";

export type NotificationRow = RowDataPacket & {
  id: string;
  user_id: string;
  kind: string;
  title: string;
  body: string;
  href: string;
  read_at: Date | string | null;
  created_at: Date | string;
};

export async function listNotifications(userId: string) {
  const [rows] = await getMysqlPool().execute<NotificationRow[]>(
    "SELECT id, user_id, kind, title, body, href, read_at, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 100",
    [userId],
  );
  return rows;
}

export async function unreadNotificationCount(userId: string) {
  const [rows] = await getMysqlPool().execute<Array<RowDataPacket & { unread: number }>>(
    "SELECT COUNT(*) AS unread FROM notifications WHERE user_id = ? AND read_at IS NULL",
    [userId],
  );
  return Number(rows[0]?.unread ?? 0);
}

export async function markNotificationsRead(userId: string, ids?: string[]) {
  if (ids?.length) {
    const placeholders = ids.map(() => "?").join(", ");
    const [result] = await getMysqlPool().execute<ResultSetHeader>(
      `UPDATE notifications SET read_at = UTC_TIMESTAMP(3) WHERE user_id = ? AND read_at IS NULL AND id IN (${placeholders})`,
      [userId, ...ids],
    );
    return result.affectedRows;
  }
  const [result] = await getMysqlPool().execute<ResultSetHeader>(
    "UPDATE notifications SET read_at = UTC_TIMESTAMP(3) WHERE user_id = ? AND read_at IS NULL",
    [userId],
  );
  return result.affectedRows;
}
