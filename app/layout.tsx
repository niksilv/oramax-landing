// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css"; // ΠΡΕΠΕΙ να υπάρχει αυτό το import

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Orama X",
  description: "Exoplanet Detector",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen flex flex-col bg-black text-slate-100">
        {/* HEADER */}
        <Header />

        {/* MAIN */}
        <main className="flex-1">
          <div className="max-w-6xl mx-auto px-4">{children}</div>
        </main>

        {/* FOOTER */}
        <Footer />
      </body>
    </html>
  );
}
