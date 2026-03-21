"use client";

import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from "react";
import { Profile } from "@/lib/types";
import ProfileCard from "./ProfileCard";

export interface ProfileWallHandle {
  refetch: () => Promise<void>;
}

// Measures the real pixel width of one "set" and derives a duration at 100px/s
function ScrollTrack({
  count,
  cardVw,
  gapPx,
  children,
}: {
  count: number;
  cardVw: number;
  gapPx: number;
  children: React.ReactNode;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState<number | null>(null);

  useEffect(() => {
    function calc() {
      const vw = window.innerWidth;
      const cardPx = (cardVw / 100) * vw - 32; // subtract 2rem padding
      const oneSetPx = (cardPx + gapPx) * count;
      // 40px per second — slow, readable from a distance
      setDuration(Math.round(oneSetPx / 28));
    }
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [count, cardVw, gapPx]);

  if (duration === null) return null;

  return (
    <div
      ref={trackRef}
      className="flex gap-6 w-max"
      style={{ animation: `scroll-left ${duration}s linear infinite` }}
    >
      {children}
    </div>
  );
}

export interface ProfileWallHandle {
  refetch: () => Promise<void>;
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

    // Expose refetch + scroll to parent
    useImperativeHandle(ref, () => ({
      refetch: async () => {
        await fetchProfiles();
        sectionRef.current?.scrollIntoView({ behavior: "smooth" });
      },
    }));

    // Poll every 15s
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

    // Duplicate just enough times so the track is always wider than the viewport.
    // 3 cards fill the screen, so we need at least ceil(6 / profiles.length) copies
    // to guarantee a seamless loop (need 2 full sets minimum).
    const copies = Math.max(2, Math.ceil(6 / profiles.length));
    const looped = Array.from({ length: copies }, () => profiles).flat();

    // Card width ≈ 33.333vw, gap = 24px. We animate one full "profiles.length" worth of cards.
    // Target speed: ~100px/s. Duration = (cardWidth + gap) * profiles.length / 100
    // We can't know vw at render time so we use a CSS custom property set via JS.
    const CARD_WIDTH_VW = 33.333;
    const GAP_PX = 24;

    return (
      <div ref={sectionRef} className="relative overflow-hidden py-4">
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-linear-to-r from-white to-transparent z-10 pointer-events-none" />
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-linear-to-l from-white to-transparent z-10 pointer-events-none" />

        <ScrollTrack count={profiles.length} cardVw={CARD_WIDTH_VW} gapPx={GAP_PX}>
          {looped.map((profile, i) => (
            <div key={`${profile.id}-${i}`} className="w-[calc(33.333vw-2rem)] shrink-0">
              <ProfileCard profile={profile} />
            </div>
          ))}
        </ScrollTrack>
      </div>
    );
  }
);

export default ProfileWall;
