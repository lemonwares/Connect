import { withRetry } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  if (!key) return Response.json({ exists: false });

  const profile = await withRetry((db) =>
    db.profile.findUnique({ where: { sessionKey: key }, select: { id: true } })
  );

  return Response.json({ exists: !!profile });
}
