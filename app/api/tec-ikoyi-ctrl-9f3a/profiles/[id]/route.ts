import { withRetry } from "@/lib/prisma";
import { NextRequest } from "next/server";

// Admin-only delete — no sessionKey required.
// Security is through obscurity of the /admin URL.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const profile = await withRetry((db) => db.profile.findUnique({ where: { id } }));
  if (!profile) return Response.json({ error: "Not found" }, { status: 404 });
  await withRetry((db) => db.profile.delete({ where: { id } }));
  return Response.json({ success: true });
}
