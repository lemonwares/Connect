"use client";

import { useEffect, useCallback, useState, useRef, useImperativeHandle, forwardRef } from "react";
import { Profile } from "@/lib/types";
import ProfileCard from "./ProfileCard";

export interface ProfileWallHandle {
  refetch: () => Promise<void>;
}

// ─── CSS for marquee ────────────────────────────────────────────────────────
const STYLE = `
@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
.mq-track { display: flex; width: max-content; will-change: transform; }
.mq-track.playing { animation: marquee linear infinite; }
`;

// ─── Marquee (carousel) mode ─────────────────────────────────────────────────
function MarqueeTrack({ children, cardCount }: { children: React.ReactNode; cardCount: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragBaseX = useRef(0);
  const duration = Math.max(10, (cardCount * 380) / 40);

  function getTranslateX(el: HTMLElement): number {
    return new DOMMatrix(window.getComputedStyle(el).transform).m41;
  }

  function pause() {
    const t = trackRef.current; if (!t) return;
    const tx = getTranslateX(t);
    t.classList.remove("playing");
    t.style.transform = `translateX(${tx}px)`;
  }

  function resume() {
    const t = trackRef.current; if (!t) return;
    const tx = getTranslateX(t);
    const halfWidth = t.scrollWidth / 2;
    const pos = ((-tx % halfWidth) + halfWidth) % halfWidth;
    const delay = -(pos / halfWidth) * duration;
    t.style.transform = "";
    t.style.animationDuration = `${duration}s`;
    t.style.animationDelay = `${delay}s`;
    t.classList.add("playing");
  }

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
    trackRef.current.style.transform = `translateX(${dragBaseX.current + (e.clientX - dragStartX.current)}px)`;
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
      <div ref={trackRef} className="mq-track">{children}</div>
    </div>
  );
}

// ─── Grid mode with infinite scroll ─────────────────────────────────────────
const PAGE_SIZE = 20;

function GridView({ initial }: { initial: Profile[] }) {
  const [profiles, setProfiles] = useState<Profile[]>(initial);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initial.length === PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/profiles?page=${page + 1}&limit=${PAGE_SIZE}`, { cache: "no-store" });
      if (res.ok) {
        const data: Profile[] = await res.json();
        setProfiles(prev => [...prev, ...data]);
        setPage(p => p + 1);
        if (data.length < PAGE_SIZE) setHasMore(false);
      }
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  }, [loading, hasMore, page]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-6">
        {profiles.map(profile => (
          <ProfileCard key={profile.id} profile={profile} />
        ))}
      </div>
      <div ref={sentinelRef} className="h-12 flex items-center justify-center mt-4">
        {loading && <span className="text-slate-400 text-sm">Loading more...</span>}
        {!hasMore && profiles.length > 0 && (
          <span className="text-slate-300 text-sm">You've seen everyone in the room</span>
        )}
      </div>
    </div>
  );
}

// ─── Main ProfileWall ────────────────────────────────────────────────────────
const ProfileWall = forwardRef<ProfileWallHandle, { initial: Profile[] }>(
  function ProfileWall({ initial }, ref) {
    const [profiles, setProfiles] = useState<Profile[]>(initial);
    const [mode, setMode] = useState<"grid" | "carousel">("grid");
    const sectionRef = useRef<HTMLDivElement>(null);

    const fetchProfiles = useCallback(async () => {
      try {
        const res = await fetch(`/api/profiles?page=1&limit=${PAGE_SIZE}`, { cache: "no-store" });
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

    const isEmpty = profiles.length === 0;

    return (
      <div ref={sectionRef}>
        {/* Toggle bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 mb-6">
          <p className="text-slate-500 text-sm font-medium">
            {isEmpty ? "No profiles yet" : mode === "grid" ? "Everyone in the room" : "Scroll to explore"}
          </p>
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setMode("grid")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              style={mode === "grid" ? { background: "#0e2240", color: "white" } : { color: "#64748b" }}
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Grid
            </button>
            <button
              onClick={() => setMode("carousel")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              style={mode === "carousel" ? { background: "#0e2240", color: "white" } : { color: "#64748b" }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              Scroll
            </button>
          </div>
        </div>

        {isEmpty ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-slate-400">
            <div className="text-7xl mb-6">👋</div>
            <p className="font-red-hat text-2xl font-bold text-slate-600">No profiles yet</p>
            <p className="text-base mt-2 text-slate-400">Be the first to create yours above</p>
          </div>
        ) : mode === "grid" ? (
          <GridView key={profiles[0]?.id ?? "empty"} initial={profiles} />
        ) : (
          <div className="relative py-4">
            <style>{STYLE}</style>
            <MarqueeTrack cardCount={(() => {
              const copies = Math.max(2, Math.ceil(6 / profiles.length));
              return Array.from({ length: copies }, () => profiles).flat().length;
            })()}>
              {(() => {
                const copies = Math.max(2, Math.ceil(6 / profiles.length));
                const set = Array.from({ length: copies }, () => profiles).flat();
                return [...set, ...set].map((profile, i) => (
                  <div key={`${profile.id}-${i}`} className="flex-none w-[90vw] sm:w-[calc(33.333vw-2rem)] px-2 sm:px-3">
                    <ProfileCard profile={profile} />
                  </div>
                ));
              })()}
            </MarqueeTrack>
          </div>
        )}
      </div>
    );
  }
);

export default ProfileWall;
