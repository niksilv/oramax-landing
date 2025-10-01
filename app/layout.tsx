// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";   // ⬅ χρησιμοποιούμε τον νέο Header (fixed, με hover dropdown)
import Footer from "@/components/Footer";   // ⬅ Footer χωρίς border

export const metadata: Metadata = {
  title: "Orama X — Exoplanet AI",
  description: "Orama X: AI/ML for exoplanet discovery — NASA Challenge 2025",
  icons: { icon: "/logos/favicon-64.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      {/* Προσοχή: το Header είναι fixed, άρα δίνουμε top padding για να μην κρύβεται το περιεχόμενο */}
      <body className="bg-[#0b0e1a] text-slate-100 antialiased">
        <Header />
        {/* pt-14 ≈ 56px για να “καθαρίσει” κάτω από το fixed header */}
        <main className="min-h-[calc(100vh-120px)] pt-14">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
