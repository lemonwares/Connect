"use client";

import { useEffect, useState } from "react";
import { INDUSTRY_LABELS, Profile } from "@/lib/types";
import { toast } from "sonner";

export default function AdminPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  async function fetchProfiles() {
    setLoading(true);
    try {
      const res = await fetch("/api/profiles", { cache: "no-store" });
      if (res.ok) setProfiles(await res.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchProfiles(); }, []);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete ${name}'s profile? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/tec-ikoyi-ctrl-9f3a/profiles/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProfiles((prev) => prev.filter((p) => p.id !== id));
        toast.success(`${name}'s profile deleted.`);
      } else {
        toast.error("Failed to delete profile.");
      }
    } finally {
      setDeleting(null);
    }
  }

  const filtered = profiles.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.city ?? "").toLowerCase().includes(q) ||
      (p.jobTitle ?? "").toLowerCase().includes(q) ||
      (p.company ?? "").toLowerCase().includes(q);
    const matchIndustry = !industryFilter || p.industry === industryFilter;
    return matchSearch && matchIndustry;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="px-6 py-5 flex items-center justify-between" style={{ background: "linear-gradient(to right, #0e2240, #1b7a8c)" }}>
        <div>
          <h1 className="font-red-hat font-black text-2xl text-white">Admin Panel</h1>
          <p className="text-blue-200 text-sm mt-0.5">TEC Ikoyi — Profile Management</p>
        </div>
        <span className="text-white/60 text-sm font-medium">{profiles.length} profiles total</span>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Search by name, city, job, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="">All industries</option>
            {Object.entries(INDUSTRY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <button
            onClick={fetchProfiles}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
            style={{ background: "#0e2240" }}
          >
            Refresh
          </button>
        </div>

        {/* Results count */}
        <p className="text-xs text-slate-400 mb-3">
          Showing {filtered.length} of {profiles.length} profiles
        </p>

        {/* Table */}
        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">No profiles found.</div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Photo</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Job / Company</th>
                  <th className="px-4 py-3 hidden md:table-cell">Industry</th>
                  <th className="px-4 py-3 hidden md:table-cell">City</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Phone</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Joined</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((p) => {
                  const isBlurred = p.photo?.startsWith("blurred:");
                  const photoSrc = isBlurred ? p.photo!.slice("blurred:".length) : p.photo;
                  const initials = p.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-200 flex items-center justify-center shrink-0">
                          {photoSrc ? (
                            <img
                              src={photoSrc}
                              alt={p.name}
                              className="w-full h-full object-cover"
                              style={{ filter: isBlurred ? "blur(3px)" : "none" }}
                            />
                          ) : (
                            <span className="text-xs font-bold text-slate-500">{initials}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{p.name}</td>
                      <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">
                        {[p.jobTitle, p.company].filter(Boolean).join(", ") || "—"}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {p.industry ? (
                          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                            {INDUSTRY_LABELS[p.industry]}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{p.city || "—"}</td>
                      <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">{p.phone || "—"}</td>
                      <td className="px-4 py-3 text-slate-400 hidden lg:table-cell text-xs">
                        {new Date(p.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          disabled={deleting === p.id}
                          className="text-xs font-semibold text-red-500 hover:text-red-700 disabled:opacity-40 transition-colors cursor-pointer"
                        >
                          {deleting === p.id ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
