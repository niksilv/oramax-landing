// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";   // νέο fixed header (logo + dropdown Our Project)
import Footer from "@/components/Footer";   // footer χωρίς border

export const metadata: Metadata = {
  title: "Orama X — Exoplanet AI",
  description: "Orama X: AI/ML for exoplanet discovery — NASA Challenge 2025",
  icons: { icon: "/logos/favicon-64.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-[#0f1220] text-slate-100 antialiased">
        <Header />
        {/* pt-12 για να μην καλύπτεται το περιεχόμενο από το fixed header (ύψος ~48px) */}
        <main className="min-h-[calc(100vh-120px)] pt-12">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
