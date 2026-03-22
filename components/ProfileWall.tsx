"use client";

import { useEffect, useCallback, useState, useRef, useImperativeHandle, forwardRef } from "react";
import { Profile } from "@/lib/types";
import ProfileCard from "./ProfileCard";

export interface ProfileWallHandle {
  refetch: () => Promise<void>;
}

const STYLE = `
@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
.mq-track {
  display: flex;
  width: max-content;
  will-change: transform;
}
.mq-track.playing {
  animation: marquee linear infinite;
}
`;

function MarqueeTrack({ children, cardCount }: { children: React.ReactNode; cardCount: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  // offset in px we've manually shifted the track
  const dragOffset = useRef(0);
  // snapshot of translateX when drag started
  const dragBaseX = useRef(0);

  // duration: ~8px/s, so for N cards * ~380px each
  const duration = Math.max(10, (cardCount * 380) / 40);

  function getTranslateX(el: HTMLElement): number {
    const style = window.getComputedStyle(el);
    const mat = new DOMMatrix(style.transform);
    return mat.m41; // translateX
  }

  function pause() {
    const t = trackRef.current;
    if (!t) return;
    const tx = getTranslateX(t);
    t.classList.remove("playing");
    t.style.transform = `translateX(${tx}px)`;
  }

  function resume() {
    const t = trackRef.current;
    if (!t) return;
    const tx = getTranslateX(t);
    const halfWidth = t.scrollWidth / 2;
    // normalise into 0..halfWidth
    const pos = ((-tx % halfWidth) + halfWidth) % halfWidth;
    const delay = -(pos / halfWidth) * duration;
    t.style.transform = "";
    t.style.animationDuration = `${duration}s`;
    t.style.animationDelay = `${delay}s`;
    t.classList.add("playing");
  }

  // start on mount
  useEffect(() => {
    if (!trackRef.current) return;
    trackRef.current.style.animationDuration = `${duration}s`;
    trackRef.current.classList.add("playing");
  }, [duration]);

  function onPointerDown(e: React.PointerEvent) {
    if (!wrapRef.current || !trackRef.current) return;
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragBaseX.current = getTranslateX(trackRef.current);
    pause();
    wrapRef.current.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!isDragging.current || !trackRef.current) return;
    const dx = e.clientX - dragStartX.current;
    const newX = dragBaseX.current + dx;
    trackRef.current.style.transform = `translateX(${newX}px)`;
  }

  function onPointerUp() {
    if (!isDragging.current) return;
    isDragging.current = false;
    resume();
  }

  return (
    <div
      ref={wrapRef}
      className="overflow-hidden select-none cursor-grab active:cursor-grabbing"
      onMouseEnter={pause}
      onMouseLeave={() => { if (!isDragging.current) resume(); }}
      onTouchStart={pause}
      onTouchEnd={() => { if (!isDragging.current) resume(); }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div ref={trackRef} className="mq-track">
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

    const copies = Math.max(2, Math.ceil(6 / profiles.length));
    const set = Array.from({ length: copies }, () => profiles).flat();
    const allCards = [...set, ...set]; // two halves for seamless -50% loop

    return (
      <div ref={sectionRef} className="relative py-4">
        <style>{STYLE}</style>
        <MarqueeTrack cardCount={set.length}>
          {allCards.map((profile, i) => (
            <div key={`${profile.id}-${i}`} className="flex-none w-[90vw] sm:w-[calc(33.333vw-2rem)] px-2 sm:px-3">
              <ProfileCard profile={profile} />
            </div>
          ))}
        </MarqueeTrack>
      </div>
    );
  }
);

export default ProfileWall;
