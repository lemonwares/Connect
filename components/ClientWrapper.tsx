"use client";

import { useRef } from "react";
import CreateProfileModal from "./CreateProfileModal";
import ProfileWall, { ProfileWallHandle } from "./ProfileWall";
import { Profile } from "@/lib/types";

interface Props {
  initial: Profile[];
  heroContent: React.ReactNode;
}

export default function ClientWrapper({ initial, heroContent }: Props) {
  const wallRef = useRef<ProfileWallHandle>(null);

  return (
    <>
      {/* Hero section */}
      <section className="relative overflow-hidden text-white min-h-screen flex flex-col items-center justify-center" style={{ background: "linear-gradient(135deg, #0e2240 0%, #0e2240 50%, #1b7a8c 100%)" }}>
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative max-w-5xl mx-auto px-6 py-16 flex flex-col items-center text-center gap-6">
          {heroContent}
          <CreateProfileModal onCreated={() => wallRef.current?.refetch()} />
        </div>
      </section>

      {/* Wall — true sibling, white section */}
      <section className="min-h-screen bg-white w-full px-4 py-12">
        <ProfileWall ref={wallRef} initial={initial} />
      </section>
    </>
  );
}
