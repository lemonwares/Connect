import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-white px-6 text-center"
      style={{ background: "linear-gradient(135deg, #0e2240 0%, #0e2240 50%, #1b7a8c 100%)" }}
    >
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="relative flex flex-col items-center gap-6 max-w-md">
        {/* Logo */}
        <div
          className="rounded-2xl px-6 py-3 mb-2"
          style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.6)",
          }}
        >
          <Image
            src="/TEC-Ikoyi-Logo-1.webp"
            alt="The Elevation Church Ikoyi"
            width={140}
            height={60}
            style={{ height: "auto" }}
          />
        </div>

        {/* 404 number */}
        <p
          className="font-red-hat font-black leading-none"
          style={{ fontSize: "clamp(6rem, 20vw, 10rem)", color: "#b8d433", lineHeight: 1 }}
        >
          404
        </p>

        <h1 className="font-red-hat font-black text-2xl sm:text-3xl leading-tight">
          You&apos;re not in the room
        </h1>
        <p className="text-blue-200 text-base leading-relaxed">
          This page doesn&apos;t exist. Head back and connect with the people who are.
        </p>

        <Link
          href="/"
          className="mt-2 font-red-hat font-semibold px-8 py-3.5 rounded-xl text-base shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
          style={{ background: "white", color: "#0e2240" }}
        >
          Back to the room
        </Link>
      </div>
    </div>
  );
}
