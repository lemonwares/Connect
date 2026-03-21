"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { INDUSTRY_LABELS } from "@/lib/types";

function generateSessionKey() {
  return crypto.randomUUID();
}

// Module-level flag — survives StrictMode remounts unlike useRef
let globalSubmitting = false;

// Notched floating label wrapper
function Field({
  label,
  required,
  children,
  span2,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  span2?: boolean;
}) {
  return (
    <div className={`relative${span2 ? " sm:col-span-2" : ""}`}>
      <span className="absolute -top-2.5 left-3 px-1 bg-white text-xs font-semibold text-slate-500 leading-none z-10">
        {label}
        {required && <span className="text-blue-500 ml-0.5">*</span>}
      </span>
      {children}
    </div>
  );
}

const inputCls =
  "w-full border border-slate-300 rounded-xl px-4 pt-3.5 pb-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400 bg-white transition placeholder:text-slate-300";

interface Props {
  onCreated: () => void;
}

export default function CreateProfileModal({ onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasProfile, setHasProfile] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Check on mount if this browser already has a session
  useEffect(() => {
    setHasProfile(!!localStorage.getItem("connecthub_session"));
  }, []);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    bio: "",
    city: "",
    jobTitle: "",
    company: "",
    industry: "",
    contactLink: "",
  });

  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal();
      document.body.style.overflow = "hidden";
    } else {
      dialogRef.current?.close();
      document.body.style.overflow = "";
    }
  }, [open]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (globalSubmitting) return;
    globalSubmitting = true;
    setError("");
    setLoading(true);

    let sessionKey = localStorage.getItem("connecthub_session");
    if (!sessionKey) {
      sessionKey = generateSessionKey();
      localStorage.setItem("connecthub_session", sessionKey);
    }

    try {
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, sessionKey }),
      });

      if (!res.ok) {
        const data = await res.json();
        const msg = data.error || "Something went wrong";
        if (res.status === 409) {
          toast.warning("Profile already exists", {
            description: "You've already created a profile from this browser.",
          });
          setOpen(false);
        } else {
          setError(msg);
        }
        return;
      }

      setOpen(false);
      setForm({ name: "", phone: "", bio: "", city: "", jobTitle: "", company: "", industry: "", contactLink: "" });
      toast.success("You're in the room!", { description: "Your profile is now live on the wall." });
      setHasProfile(true);
      onCreated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      globalSubmitting = false;
      setLoading(false);
    }
  }

  return (
    <>
      {hasProfile ? (
        <div className="inline-flex items-center gap-2.5 bg-white/15 border border-white/30 rounded-full px-6 py-3 text-white font-red-hat font-semibold text-base backdrop-blur-sm">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-400 shrink-0">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
          Profile created
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="bg-white hover:cursor-pointer hover:bg-blue-50 hover:scale-105 active:scale-95 text-blue-700 font-red-hat font-semibold px-8 py-3.5 rounded-xl text-base shadow-lg shadow-blue-900/30 transition-all duration-500 ease-in-out"
        >
          Create Your Profile
        </button>
      )}

      <dialog
        ref={dialogRef}
        className="fixed inset-0 m-auto w-full max-w-lg rounded-2xl p-0 border-0 shadow-2xl backdrop:bg-blue-950/60 backdrop:backdrop-blur-sm"
        onClose={() => setOpen(false)}
      >
        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-linear-to-r from-blue-700 to-blue-500 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="font-red-hat font-bold text-xl text-white">Create Your Profile</h2>
              <p className="text-blue-100 text-sm mt-0.5">Let people know who you are</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white text-3xl leading-none transition-colors cursor-pointer"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col max-h-[80vh]">
            {/* Scrollable fields */}
            <div className="px-6 py-6 flex flex-col gap-5 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                <Field label="Full Name" required span2>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className={inputCls}
                  />
                </Field>

                <Field label="Phone Number">
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+234 800 000 0000"
                    className={inputCls}
                  />
                </Field>

                <Field label="City">
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Lagos, Nigeria"
                    className={inputCls}
                  />
                </Field>

                <Field label="Job Title">
                  <input
                    name="jobTitle"
                    value={form.jobTitle}
                    onChange={handleChange}
                    placeholder="Software Engineer"
                    className={inputCls}
                  />
                </Field>

                <Field label="Company">
                  <input
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="Acme Inc."
                    className={inputCls}
                  />
                </Field>

                <Field label="Industry / Role" span2>
                  <select
                    name="industry"
                    value={form.industry}
                    onChange={handleChange}
                    className={inputCls}
                  >
                    <option value="">Select your industry</option>
                    {Object.entries(INDUSTRY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Bio / Tagline" span2>
                  <textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    placeholder="A short line about yourself..."
                    rows={2}
                    className={`${inputCls} resize-none`}
                  />
                </Field>

                <Field label="Contact Link" span2>
                  <input
                    name="contactLink"
                    value={form.contactLink}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/yourname"
                    className={inputCls}
                  />
                </Field>

              </div>

              {error && (
                <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-2">
                  {error}
                </p>
              )}
            </div>

            {/* Pinned submit button */}
            <div className="px-6 py-4 border-t border-slate-100 bg-white">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-red-hat font-semibold py-3 rounded-xl transition-colors cursor-pointer"
              >
                {loading ? "Creating..." : "Join the Room"}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
