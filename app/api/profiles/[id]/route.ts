import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  const { sessionKey, ...data } = body;

  if (!sessionKey) {
    return Response.json({ error: "sessionKey required" }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({ where: { id } });

  if (!profile) return Response.json({ error: "Not found" }, { status: 404 });
  if (profile.sessionKey !== sessionKey) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const updated = await prisma.profile.update({ where: { id }, data });
  return Response.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { sessionKey } = await request.json();

  if (!sessionKey) {
    return Response.json({ error: "sessionKey required" }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({ where: { id } });

  if (!profile) return Response.json({ error: "Not found" }, { status: 404 });
  if (profile.sessionKey !== sessionKey) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  await prisma.profile.delete({ where: { id } });
  return Response.json({ success: true });
}
