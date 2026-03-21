import { withRetry } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const profiles = await withRetry((db) =>
    db.profile.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        photo: true,
        phone: true,
        bio: true,
        city: true,
        stateOfOrigin: true,
        area: true,
        sex: true,
        genotype: true,
        lookingFor: true,
        jobTitle: true,
        company: true,
        industry: true,
        contactLink: true,
        funFact: true,
        createdAt: true,
      },
    })
  );
  return Response.json(profiles);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, phone, bio, city, stateOfOrigin, area, sex, genotype, lookingFor, jobTitle, company, industry, contactLink, photo, funFact, sessionKey } = body;

  if (!name || !sessionKey) {
    return Response.json({ error: "name and sessionKey are required" }, { status: 400 });
  }

  try {
    const profile = await withRetry((db) =>
      db.profile.create({
        data: { name, phone, bio, city, stateOfOrigin, area, sex, genotype, lookingFor, jobTitle, company, industry, contactLink, photo, funFact, sessionKey },
      })
    );
    return Response.json(profile, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return Response.json(
        { error: "You already have a profile. You can only create one per session." },
        { status: 409 }
      );
    }
    throw err;
  }
}
