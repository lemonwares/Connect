"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { INDUSTRY_LABELS } from "@/lib/types";

function generateSessionKey() {
  return crypto.randomUUID();
}

let globalSubmitting = false;

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
        {required && <span className="ml-0.5" style={{ color: "#1b7a8c" }}>*</span>}
      </span>
      {children}
    </div>
  );
}

const inputCls =
  "w-full border border-slate-300 rounded-xl px-4 pt-3.5 pb-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400 bg-white transition placeholder:text-slate-300";

// Resize + compress image to base64 on the client (max 240px, JPEG q=0.72)
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 240;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };
    img.onerror = reject;
    img.src = url;
  });
}

interface Props {
  onCreated: () => void;
}

export default function CreateProfileModal({ onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasProfile, setHasProfile] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [blurPhoto, setBlurPhoto] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check session validity — runs on mount and every 15s to detect admin deletions
  const checkSession = useCallback(() => {
    const sessionKey = localStorage.getItem("connecthub_session");
    if (!sessionKey) {
      setHasProfile(false);
      return;
    }
    fetch("/api/profiles/session?key=" + encodeURIComponent(sessionKey))
      .then((r) => r.json())
      .then((data) => {
        if (data.exists) {
          setHasProfile(true);
        } else {
          // Profile was deleted by admin — clear stale session
          localStorage.removeItem("connecthub_session");
          setHasProfile(false);
        }
      })
      .catch(() => {
        // Network error — keep current state to avoid false resets
      });
  }, []);

  useEffect(() => {
    checkSession();
    const id = setInterval(checkSession, 15000);
    return () => clearInterval(id);
  }, [checkSession]);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    bio: "",
    city: "",
    jobTitle: "",
    company: "",
    industry: "",
    contactLink: "",
    funFact: "",
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

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const b64 = await compressImage(file);
      setPhotoBase64(b64);
      setPhotoPreview(b64);
    } catch {
      toast.error("Could not process image. Try another file.");
    }
  }

  function removePhoto() {
    setPhotoBase64(null);
    setPhotoPreview(null);
    setBlurPhoto(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
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

    // Encode blur preference into the photo string so no schema change needed
    // Format: "blurred:<base64>" or just "<base64>"
    const photoPayload = photoBase64
      ? blurPhoto ? `blurred:${photoBase64}` : photoBase64
      : null;

    try {
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, photo: photoPayload, sessionKey }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 409) {
          toast.warning("Profile already exists", {
            description: "You've already created a profile from this browser.",
          });
          setOpen(false);
        } else {
          setError(data.error || "Something went wrong");
        }
        return;
      }

      setOpen(false);
      setForm({ name: "", phone: "", bio: "", city: "", jobTitle: "", company: "", industry: "", contactLink: "", funFact: "" });
      removePhoto();
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
          className="hover:cursor-pointer hover:scale-105 active:scale-95 font-red-hat font-semibold px-8 py-3.5 rounded-xl text-base shadow-lg transition-all duration-500 ease-in-out"
          style={{ background: "white", color: "#0e2240" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#b8d433"; e.currentTarget.style.color = "#0e2240"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#0e2240"; }}
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
          <div className="px-6 py-4 flex items-center justify-between" style={{ background: "linear-gradient(to right, #0e2240, #1b7a8c)" }}>
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
            <div className="px-6 py-6 flex flex-col gap-5 overflow-y-auto flex-1">

              {/* Photo upload box */}
              <div className="sm:col-span-2">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 transition cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-1"
                >
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      style={{ filter: blurPhoto ? "blur(3px)" : "none", transform: blurPhoto ? "scale(1.1)" : "none" }}
                    />
                  ) : (
                    <>
                      <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      <span className="text-xs text-slate-400 font-medium text-center leading-tight px-1">Upload photo</span>
                    </>
                  )}
                </div>

                {photoPreview && (
                  <div className="flex items-center gap-3 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div
                        className="relative w-9 h-5 rounded-full transition-colors duration-200"
                        style={{ background: blurPhoto ? "#1b7a8c" : "#e2e8f0" }}
                        onClick={() => setBlurPhoto(v => !v)}
                      >
                        <div
                          className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
                          style={{ transform: blurPhoto ? "translateX(18px)" : "translateX(2px)" }}
                        />
                      </div>
                      <span className="text-xs text-slate-500">Blur photo</span>
                    </label>
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="text-xs text-red-400 hover:text-red-600 transition cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Full Name" required span2>
                  <input name="name" value={form.name} onChange={handleChange} required placeholder="John Doe" className={inputCls} />
                </Field>

                <Field label="Phone Number">
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="+234 800 000 0000" className={inputCls} />
                </Field>

                <Field label="City">
                  <input name="city" value={form.city} onChange={handleChange} placeholder="Ago-Hausa, Ajeromi-Ifelodun, Lagos State, Nigeria" className={inputCls} />
                </Field>

                <Field label="Job Title">
                  <input name="jobTitle" value={form.jobTitle} onChange={handleChange} placeholder="Software Engineer" className={inputCls} />
                </Field>

                <Field label="Company">
                  <input name="company" value={form.company} onChange={handleChange} placeholder="Acme Inc." className={inputCls} />
                </Field>

                <Field label="Industry / Role" span2>
                  <select name="industry" value={form.industry} onChange={handleChange} className={inputCls}>
                    <option value="">Select your industry</option>
                    {Object.entries(INDUSTRY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Bio / Tagline" span2>
                  <textarea name="bio" value={form.bio} onChange={handleChange} placeholder="A short line about yourself..." rows={2} maxLength={100} className={`${inputCls} resize-none`} />
                  <p className={`text-xs mt-1 text-right ${form.bio.length > 85 ? "text-red-400" : "text-slate-400"}`}>{form.bio.length}/100</p>
                </Field>

                <Field label="Fun Fact" span2>
                  <textarea
                    name="funFact"
                    value={form.funFact}
                    onChange={handleChange}
                    placeholder="Something interesting about you..."
                    rows={2}
                    maxLength={30}
                    className={`${inputCls} resize-none`}
                  />
                  <p className={`text-xs mt-1 text-right ${form.funFact.length > 24 ? "text-red-400" : "text-slate-400"}`}>{form.funFact.length}/30</p>
                </Field>
              </div>

              {error && (
                <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-2">{error}</p>
              )}
            </div>

            {/* Pinned submit */}
            <div className="px-6 py-4 border-t border-slate-100 bg-white">
              <button
                type="submit"
                disabled={loading}
                className="w-full disabled:opacity-60 text-white font-red-hat font-semibold py-3 rounded-xl transition-colors cursor-pointer"
                style={{ background: "#0e2240" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#1b7a8c")}
                onMouseLeave={e => (e.currentTarget.style.background = "#0e2240")}
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
