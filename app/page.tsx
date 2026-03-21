import { prisma } from "@/lib/prisma";
import ClientWrapper from "@/components/ClientWrapper";
import { Profile } from "@/lib/types";

async function getProfiles(): Promise<Profile[]> {
  try {
    const profiles = await prisma.profile.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, phone: true, bio: true, city: true,
        jobTitle: true, company: true, industry: true, contactLink: true, createdAt: true,
      },
    });
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
      <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium text-blue-100">
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        Live Session
      </div>
      <h1 className="font-red-hat font-black text-4xl sm:text-5xl lg:text-6xl leading-tight tracking-tight">
        Meet the people
        <br />
        <span className="text-blue-200">in the room</span>
      </h1>
      <p className="text-blue-100 text-lg max-w-md leading-relaxed">
        Create your profile and connect with everyone here today.
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
