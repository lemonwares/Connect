import { withRetry } from "@/lib/prisma";
import ClientWrapper from "@/components/ClientWrapper";
import { Profile } from "@/lib/types";
import Image from "next/image";

async function getProfiles(): Promise<Profile[]> {
  try {
    const profiles = await withRetry((db) =>
      db.profile.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true, name: true, photo: true, phone: true, bio: true, city: true,
          jobTitle: true, company: true, industry: true, contactLink: true, funFact: true, createdAt: true,
        },
      })
    );
    return profiles.map((p: typeof profiles[number]) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
    })) as Profile[];
  } catch {
    return [];
  }
}

export default async function Home() {
  const profiles = await getProfiles();

  const heroContent = (
    <>
      <div className="rounded-2xl px-6 py-3" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.6)" }}>
        <Image
          src="/TEC-Ikoyi-Logo-1.webp"
          alt="The Elevation Church Ikoyi"
          width={180}
          height={80}
          style={{ height: "auto" }}
        />
      </div>
      <h1 className="font-red-hat font-black text-4xl sm:text-5xl lg:text-6xl leading-tight tracking-tight">
        Meet someone
        <br />
        <span style={{ color: "#b8d433" }}>in the room</span>
      </h1>
      <p className="text-blue-100 text-lg max-w-md leading-relaxed">
        Create your profile and connect with someone here today.
        Discover who&apos;s in the room.
      </p>
    </>
  );

  return (
    <main>
      <ClientWrapper initial={profiles} heroContent={heroContent} />
    </main>
  );
}
