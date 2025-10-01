// components/Navbar.tsx
import React from "react";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full flex items-center justify-center gap-6 text-sm">
      <Link href="/" className="hover:opacity-80">Home</Link>
      <Link href="/our-project/our-challenge" className="hover:opacity-80">Our Challenge</Link>
      <Link href="/contact-us" className="hover:opacity-80">Contact</Link>
      <Link href="/detector" className="hover:opacity-80">Detector</Link>
    </nav>
  );
}
