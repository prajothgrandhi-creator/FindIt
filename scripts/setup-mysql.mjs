import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";

const schemaPath = fileURLToPath(new URL("../database/schema.sql", import.meta.url));
const schema = await readFile(schemaPath, "utf8");
const statements = schema.split(";").map((statement) => statement.trim()).filter(Boolean);
const url = process.env.MYSQL_URL;

if (!url) {
  console.error("MYSQL_URL is missing. Add it to .env.local before setting up the schema.");
  process.exit(1);
}

const connection = new URL(url);
if (connection.protocol !== "mysql:") {
  console.error("MYSQL_URL must use the mysql:// scheme.");
  process.exit(1);
}
const pool = mysql.createPool({
  host: connection.hostname,
  port: Number(connection.port || 3306),
  user: decodeURIComponent(connection.username),
  password: decodeURIComponent(connection.password),
  database: decodeURIComponent(connection.pathname.replace(/^\//, "")),
  ssl: connection.searchParams.get("ssl") === "true" ? { rejectUnauthorized: true } : undefined,
  connectionLimit: 2,
  timezone: "Z",
  charset: "utf8mb4",
});
try {
  for (const statement of statements) await pool.query(statement);
  console.log(JSON.stringify({ schemaReady: true, tables: ["reports", "claims", "found_responses", "sightings", "notifications"] }));
} catch (error) {
  const code = error && typeof error === "object" && "code" in error && typeof error.code === "string"
    ? error.code
    : "MYSQL_SETUP_FAILED";
  console.error(JSON.stringify({ schemaReady: false, errorCode: code }));
  process.exitCode = 1;
} finally {
  await pool.end();
}
