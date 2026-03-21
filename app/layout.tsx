import type { Metadata } from "next";
import { Red_Hat_Display, Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const redHatDisplay = Red_Hat_Display({
  variable: "--font-red-hat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TEC Ikoyi — Meet the people in the room",
  description: "A church networking platform to discover and connect with people.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${redHatDisplay.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-slate-50 font-inter antialiased">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
