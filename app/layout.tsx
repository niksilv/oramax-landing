// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import "./ox-nav.css";   // 👈 νέο import
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Orama X — Exoplanet AI",
  description: "Orama X: AI/ML for exoplanet discovery — NASA Challenge 2025",
  icons: {
    icon: "/logos/favicon-64.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-[#0f1220] text-slate-100 antialiased">
        <Navbar />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
