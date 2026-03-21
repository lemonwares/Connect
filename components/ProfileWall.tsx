"use client";

import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from "react";
import { Profile } from "@/lib/types";
import ProfileCard from "./ProfileCard";

export interface ProfileWallHandle {
  refetch: () => Promise<void>;
}

const SPEED_PX_PER_S = 8;

function ScrollTrack({ count, children }: { count: number; children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const scrollAtDragStart = useRef(0);
  const [cardWidth, setCardWidth] = useState(0);
  const [gap, setGap] = useState(0);

  // Calculate one-set width for seamless loop reset
  useEffect(() => {
    function calc() {
      const isMobile = window.innerWidth < 640;
      const vw = window.innerWidth;
      setCardWidth(isMobile ? vw * 0.9 : (vw * 0.33333) - 32);
      setGap(isMobile ? 16 : 24);
    }
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  // RAF auto-scroll loop
  useEffect(() => {
    if (!cardWidth || !count) return;
    const oneSetPx = (cardWidth + gap) * count;

    function tick(ts: number) {
      if (!containerRef.current) { rafRef.current = requestAnimationFrame(tick); return; }
      if (!pausedRef.current) {
        const dt = lastTimeRef.current !== null ? (ts - lastTimeRef.current) / 1000 : 0;
        lastTimeRef.current = ts;
        containerRef.current.scrollLeft += SPEED_PX_PER_S * dt;
        // Seamless loop: when we've scrolled one full set, jump back
        if (containerRef.current.scrollLeft >= oneSetPx) {
          containerRef.current.scrollLeft -= oneSetPx;
        }
      } else {
        lastTimeRef.current = ts;
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [cardWidth, gap, count]);

  function onPointerDown(e: React.PointerEvent) {
    if (!containerRef.current) return;
    isDragging.current = true;
    pausedRef.current = true;
    dragStartX.current = e.clientX;
    scrollAtDragStart.current = containerRef.current.scrollLeft;
    containerRef.current.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!isDragging.current || !containerRef.current) return;
    const dx = dragStartX.current - e.clientX;
    containerRef.current.scrollLeft = scrollAtDragStart.current + dx;
  }

  function onPointerUp() {
    isDragging.current = false;
    pausedRef.current = false;
  }

  return (
    <div
      ref={containerRef}
      className="overflow-x-scroll cursor-grab active:cursor-grabbing select-none"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onMouseEnter={() => { if (!isDragging.current) pausedRef.current = true; }}
      onMouseLeave={() => { if (!isDragging.current) pausedRef.current = false; }}
      onTouchStart={() => { pausedRef.current = true; }}
      onTouchEnd={() => { pausedRef.current = false; }}
    >
      <div className="flex gap-4 sm:gap-6 w-max">
        {children}
      </div>
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
      } catch { /* silently fail */ }
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

    // Enough copies so the loop never runs out of content
    const copies = Math.max(3, Math.ceil(9 / profiles.length));
    const looped = Array.from({ length: copies }, () => profiles).flat();

    return (
      <div ref={sectionRef} className="relative py-4">
        <ScrollTrack count={profiles.length}>
          {looped.map((profile, i) => (
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
