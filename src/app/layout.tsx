import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Orama X  Space Intelligence",
  description: "Exoplanet discovery tools and research from Orama X.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="nav container">
          <Link href="/" style={{fontWeight:800, fontSize:"20px"}}>
            Orama<span style={{color:"var(--brand)"}}>X</span>
          </Link>
          <nav style={{display:"flex", gap:8}}>
            <Link href="/">Home</Link>
            <Link href="/detector">Exoplanet Detector</Link>
            <Link href="/contact">Contact</Link>
          </nav>
        </header>
        <main className="container">{children}</main>
        <footer>
          <div className="container" style={{padding:"18px 0", display:"flex", justifyContent:"space-between", fontSize:14}}>
            <span>© {new Date().getFullYear()} Orama X</span>
            <span>Next.js on Vercel  API on Fly.io</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
