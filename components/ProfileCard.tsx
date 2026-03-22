"use client";

import { Profile, INDUSTRY_LABELS } from "@/lib/types";

const AVATAR_GRADIENTS = [
  ["#1d4ed8", "#3b82f6"],
  ["#7c3aed", "#a78bfa"],
  ["#0f766e", "#2dd4bf"],
  ["#b45309", "#fbbf24"],
  ["#be185d", "#f472b6"],
  ["#15803d", "#4ade80"],
  ["#c2410c", "#fb923c"],
  ["#1e40af", "#60a5fa"],
  ["#6d28d9", "#c084fc"],
  ["#0e7490", "#22d3ee"],
  ["#9f1239", "#fb7185"],
  ["#065f46", "#34d399"],
];

function nameToIndex(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return hash % AVATAR_GRADIENTS.length;
}

function Avatar({ name, photo, size = 96 }: { name: string; photo?: string | null; size?: number }) {
  // photo may be prefixed with "blurred:" to indicate blur preference
  const isBlurred = photo?.startsWith("blurred:");
  const src = isBlurred ? photo!.slice("blurred:".length) : photo;

  if (src) {
    return (
      <div
        className="rounded-2xl shrink-0 ring-4 ring-white shadow-md overflow-hidden"
        style={{ width: size, height: size }}
      >
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          style={{ filter: isBlurred ? "blur(3px)" : "none", transform: isBlurred ? "scale(1.1)" : "none" }}
        />
      </div>
    );
  }

  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  const [from, to] = AVATAR_GRADIENTS[nameToIndex(name)];
  return (
    <div
      className="rounded-2xl flex items-center justify-center text-white font-bold font-red-hat shrink-0 ring-4 ring-white shadow-md"
      style={{ width: size, height: size, fontSize: size * 0.33, background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {initials}
    </div>
  );
}

export default function ProfileCard({ profile }: { profile: Profile }) {
  const industryLabel = profile.industry ? INDUSTRY_LABELS[profile.industry] : null;
  const jobLine = profile.jobTitle || null;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 w-full overflow-hidden" style={{ minHeight: "560px" }}>

      {/* Top row: avatar + industry badge */}
      <div className="flex items-start justify-between shrink-0">
        <Avatar name={profile.name} photo={profile.photo} size={96} />
        {industryLabel && (
          <span className="text-xs font-bold tracking-widest uppercase text-slate-400 border border-slate-200 rounded-full px-4 py-1.5">
            {industryLabel}
          </span>
        )}
      </div>

      {/* Name + job */}
      <div className="flex flex-col gap-1 mt-4 shrink-0">
        <h3 className="font-red-hat font-black text-3xl text-slate-900 leading-tight">
          {profile.name}
        </h3>
        {jobLine && (
          <p className="text-blue-600 text-base font-semibold">{jobLine}</p>
        )}
      </div>

      {/* Bio + fun fact — flex-1 so footer is always visible */}
      <div className="flex flex-col gap-3 mt-4 flex-1 overflow-hidden">
        {profile.bio && (
          <p className="text-slate-400 text-sm leading-relaxed wrap-break-word">{profile.bio}</p>
        )}
        {profile.funFact && (
          <div className="flex items-start gap-2 bg-slate-50 rounded-xl px-3 py-2">
            <span className="text-sm shrink-0">💡</span>
            <ul className="flex flex-col gap-1">
              {profile.funFact.split(",").map((fact, i) => fact.trim() && (
                <li key={i} className="text-slate-500 text-sm leading-relaxed flex items-start gap-1.5">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                  {fact.trim()}
                </li>
              ))}
            </ul>
          </div>
        )}
        {(profile.lookingFor || profile.genotype || profile.sex) && (
          <div className="flex flex-wrap gap-2 mt-1">
            {profile.lookingFor && (
              <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: "#f0fdf4", color: "#15803d" }}>
                🔍 {profile.lookingFor}
              </span>
            )}
            {profile.genotype && (
              <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-slate-100 text-slate-500">
                {profile.genotype}
              </span>
            )}
            {profile.sex && (
              <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-slate-100 text-slate-500">
                {profile.sex}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer — always pinned at bottom */}
      <div className="flex flex-col gap-2 pt-4 border-t border-slate-100 shrink-0 mt-3">
        {profile.area && (
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <svg className="w-4 h-4 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span>Lives in {profile.area}</span>
          </div>
        )}
        {profile.phone && (
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <a href={`tel:${profile.phone}`} className="hover:text-blue-600 transition-colors">{profile.phone}</a>
          </div>
        )}
      </div>
    </div>
  );
}
