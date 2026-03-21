import type { Metadata } from "next";
import { Red_Hat_Display, Inter, Playfair_Display, Lora } from "next/font/google";
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

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "TEC Ikoyi — Meet the people in the room",
  description: "A church networking platform to discover and connect with people.",
  icons: {
    icon: "/TEC-Ikoyi-Logo-1.webp",
    apple: "/TEC-Ikoyi-Logo-1.webp",
  },
  openGraph: {
    title: "TEC Ikoyi — Meet the people in the room",
    description: "Create your profile and connect with everyone here today.",
    images: [{ url: "/TEC-Ikoyi-Logo-1.webp", width: 800, height: 400, alt: "The Elevation Church Ikoyi" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TEC Ikoyi — Meet the people in the room",
    description: "Create your profile and connect with everyone here today.",
    images: ["/TEC-Ikoyi-Logo-1.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${redHatDisplay.variable} ${inter.variable} ${lora.variable}`}>
      <body className="min-h-screen bg-slate-50 font-inter antialiased">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
