import "server-only";
import type { RowDataPacket } from "mysql2/promise";
import { getMysqlPool } from "@/lib/mysql/server";

type ImageRow = RowDataPacket & { image_data: Buffer | null; image_mime: string | null };

export async function GET(_request: Request, context: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await context.params;
  const [rows] = await getMysqlPool().execute<ImageRow[]>(
    "SELECT image_data, image_mime FROM reports WHERE id = ? LIMIT 1",
    [reportId],
  );
  const image = rows[0];
  if (!image?.image_data || !image.image_mime) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(image.image_data), {
    headers: {
      "Content-Type": image.image_mime,
      "Cache-Control": "public, max-age=60",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
