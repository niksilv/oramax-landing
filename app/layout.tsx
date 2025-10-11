import type { Metadata } from "next";
import "./globals.css";
import "./ox-nav.css";          // ⬅️ το CSS του navbar
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Orama X — Exoplanet AI",
  description: "Orama X: AI/ML for exoplanet discovery",
  icons: { icon: "/logos/favicon-64.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-[#0f1220] text-slate-100 antialiased">
        <Navbar />
        <main className="min-h-[calc(100vh-120px)]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
