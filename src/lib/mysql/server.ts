import "server-only";
import { createPool, type Pool } from "mysql2/promise";

const globalForMysql = globalThis as typeof globalThis & { findItMysqlPool?: Pool };

export function getMysqlPool() {
  const url = process.env.MYSQL_URL;
  if (!url) throw new Error("MYSQL_URL is not configured.");
  if (!globalForMysql.findItMysqlPool) {
    const connection = new URL(url);
    if (connection.protocol !== "mysql:") throw new Error("MYSQL_URL must use the mysql:// scheme.");
    globalForMysql.findItMysqlPool = createPool({
      host: connection.hostname,
      port: Number(connection.port || 3306),
      user: decodeURIComponent(connection.username),
      password: decodeURIComponent(connection.password),
      database: decodeURIComponent(connection.pathname.replace(/^\//, "")),
      ssl: connection.searchParams.get("ssl") === "true" ? { rejectUnauthorized: true } : undefined,
      connectionLimit: 10,
      waitForConnections: true,
      queueLimit: 0,
      timezone: "Z",
      charset: "utf8mb4",
      enableKeepAlive: true,
    });
  }
  return globalForMysql.findItMysqlPool;
}
