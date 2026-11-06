import "server-only";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { getMysqlPool } from "@/lib/mysql/server";
import type { ReportStatus, ReportType, ReportView } from "@/lib/mysql/types";
export type { ReportStatus, ReportType, ReportView } from "@/lib/mysql/types";

export interface ReportRow extends RowDataPacket {
  id: string;
  owner_id: string;
  type: ReportType;
  item_name: string;
  description: string;
  location: string;
  occurred_at: Date | string | null;
  image_mime: string | null;
  has_image: number;
  status: ReportStatus;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface SightingRow extends RowDataPacket {
  id: string;
  report_id: string;
  description: string;
  location: string;
  occurred_at: Date | string | null;
  created_at: Date | string;
  item_name: string;
}

interface FoundResponseRow extends ReportRow {
  lost_report_id: string;
}

export function toReportView(row: ReportRow): ReportView {
  return {
    id: row.id,
    ownerId: row.owner_id,
    type: row.type,
    itemName: row.item_name,
    description: row.description,
    location: row.location,
    occurredAt: row.occurred_at ? new Date(row.occurred_at).toISOString() : null,
    hasImage: Boolean(row.has_image),
    imageMime: row.image_mime,
    status: row.status,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export async function listReports(options: {
  ownerId?: string;
  excludeOwnerId?: string;
  type?: ReportType;
  status?: ReportStatus;
  query?: string;
  limit?: number;
}) {
  const where: string[] = [];
  const values: Array<string | number> = [];
  if (options.ownerId) { where.push("owner_id = ?"); values.push(options.ownerId); }
  if (options.excludeOwnerId) { where.push("owner_id <> ?"); values.push(options.excludeOwnerId); }
  if (options.type) { where.push("type = ?"); values.push(options.type); }
  if (options.status) { where.push("status = ?"); values.push(options.status); }
  if (options.query) {
    const like = `%${options.query.slice(0, 100)}%`;
    where.push("(item_name LIKE ? OR description LIKE ? OR location LIKE ?)");
    values.push(like, like, like);
  }
  values.push(Math.min(Math.max(options.limit ?? 50, 1), 100));
  const sql = `SELECT id, owner_id, type, item_name, description, location, occurred_at, image_mime, (image_data IS NOT NULL) AS has_image, status, created_at, updated_at FROM reports ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY created_at DESC LIMIT ?`;
  const [rows] = await getMysqlPool().execute<ReportRow[]>(sql, values);
  return rows.map(toReportView);
}

export async function getReport(id: string) {
  const [rows] = await getMysqlPool().execute<ReportRow[]>(
    "SELECT id, owner_id, type, item_name, description, location, occurred_at, image_mime, (image_data IS NOT NULL) AS has_image, status, created_at, updated_at FROM reports WHERE id = ? LIMIT 1",
    [id],
  );
  return rows[0] ? toReportView(rows[0]) : null;
}

export async function listSightingsForReportOwners(ownerId: string) {
  const [rows] = await getMysqlPool().execute<SightingRow[]>(
    "SELECT s.id, s.report_id, s.description, s.location, s.occurred_at, s.created_at, r.item_name FROM sightings s JOIN reports r ON r.id = s.report_id WHERE r.owner_id = ? ORDER BY s.created_at DESC LIMIT 100",
    [ownerId],
  );
  return rows;
}

export async function listFoundResponsesForReportOwners(ownerId: string) {
  const [rows] = await getMysqlPool().execute<FoundResponseRow[]>(
    "SELECT fr.lost_report_id, r.id, r.owner_id, r.type, r.item_name, r.description, r.location, r.occurred_at, r.image_mime, (r.image_data IS NOT NULL) AS has_image, r.status, r.created_at, r.updated_at FROM found_responses fr JOIN reports lost ON lost.id = fr.lost_report_id JOIN reports r ON r.id = fr.found_report_id WHERE lost.owner_id = ? ORDER BY fr.created_at DESC LIMIT 100",
    [ownerId],
  );
  return rows.map((row) => ({ lostReportId: row.lost_report_id, report: toReportView(row) }));
}

export async function listLostReportIdsRespondedToByFinder(finderId: string) {
  const [rows] = await getMysqlPool().execute<Array<RowDataPacket & { lost_report_id: string }>>(
    "SELECT lost_report_id FROM found_responses WHERE finder_id = ?",
    [finderId],
  );
  return rows.map((row) => row.lost_report_id);
}

export async function setReportStatus(id: string, ownerId: string, status: ReportStatus) {
  const [result] = await getMysqlPool().execute<ResultSetHeader>(
    "UPDATE reports SET status = ?, updated_at = UTC_TIMESTAMP(3) WHERE id = ? AND owner_id = ?",
    [status, id, ownerId],
  );
  return result.affectedRows === 1;
}

export async function getReportSummary(ownerId: string) {
  const [rows] = await getMysqlPool().execute<Array<RowDataPacket & { total: number; open: number; resolved: number }>>(
    "SELECT COUNT(*) AS total, COALESCE(SUM(status = 'open'), 0) AS open, COALESCE(SUM(status = 'resolved'), 0) AS resolved FROM reports WHERE owner_id = ?",
    [ownerId],
  );
  const summary = rows[0];
  return summary
    ? { total: Number(summary.total), open: Number(summary.open), resolved: Number(summary.resolved) }
    : { total: 0, open: 0, resolved: 0 };
}
