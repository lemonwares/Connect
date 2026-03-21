"use client";

import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from "react";
import { Profile } from "@/lib/types";
import ProfileCard from "./ProfileCard";

export interface ProfileWallHandle {
  refetch: () => Promise<void>;
}

const SPEED_PX_PER_S = 18; // px per second — slow, readable from a distance

function ScrollTrack({
  count,
  children,
}: {
  count: number;
  children: React.ReactNode;
}) {
  const [duration, setDuration] = useState<number | null>(null);

  useEffect(() => {
    function calc() {
      const isMobile = window.innerWidth < 640;
      const vw = window.innerWidth;
      // mobile: 1 card = 90vw, gap 16px | desktop: 1 card = 33.333vw - 2rem, gap 24px
      const cardPx = isMobile ? vw * 0.9 : (vw * 0.33333) - 32;
      const gapPx = isMobile ? 16 : 24;
      const oneSetPx = (cardPx + gapPx) * count;
      setDuration(Math.round(oneSetPx / SPEED_PX_PER_S));
    }
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [count]);

  if (duration === null) return null;

  return (
    <div
      className="flex gap-4 sm:gap-6 w-max"
      style={{ animation: `scroll-left ${duration}s linear infinite` }}
    >
      {children}
    </div>
  );
}

const ProfileWall = forwardRef<ProfileWallHandle, { initial: Profile[] }>(
  function ProfileWall({ initial }, ref) {
    const [profiles, setProfiles] = useState<Profile[]>(initial);
    const sectionRef = useRef<HTMLDivElement>(null);

    const fetchProfiles = useCallback(async () => {
      try {
        const res = await fetch("/api/profiles", { cache: "no-store" });
        if (res.ok) setProfiles(await res.json());
      } catch {
        // silently fail
      }
    }, []);

    useImperativeHandle(ref, () => ({
      refetch: async () => {
        await fetchProfiles();
        sectionRef.current?.scrollIntoView({ behavior: "smooth" });
      },
    }));

    useEffect(() => {
      const id = setInterval(fetchProfiles, 15000);
      return () => clearInterval(id);
    }, [fetchProfiles]);

    if (profiles.length === 0) {
      return (
        <div ref={sectionRef} className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
          <div className="text-7xl mb-6">👋</div>
          <p className="font-red-hat text-2xl font-bold text-slate-600">No profiles yet</p>
          <p className="text-base mt-2 text-slate-400">Be the first to create yours above</p>
        </div>
      );
    }

    // Mobile: 1 card fills view, need more copies to fill the loop
    // Desktop: 3 cards fill view, need ceil(6 / count) copies minimum
    // Always at least 2 full sets for a seamless loop
    const copies = Math.max(2, Math.ceil(6 / profiles.length));
    const looped = Array.from({ length: copies }, () => profiles).flat();

    return (
      <div ref={sectionRef} className="relative overflow-hidden py-4">
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-linear-to-r from-white to-transparent z-10 pointer-events-none" />
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-linear-to-l from-white to-transparent z-10 pointer-events-none" />

        <ScrollTrack count={profiles.length}>
          {looped.map((profile, i) => (
            // mobile: 90vw per card | desktop: 33.333vw - 2rem per card
            <div key={`${profile.id}-${i}`} className="w-[90vw] sm:w-[calc(33.333vw-2rem)] shrink-0">
              <ProfileCard profile={profile} />
            </div>
          ))}
        </ScrollTrack>
      </div>
    );
  }
);

export default ProfileWall;
