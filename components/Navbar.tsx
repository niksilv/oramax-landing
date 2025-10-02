import React from "react";
import Link from "next/link";

export default function Navbar() {
  return (
    <div className="flex items-center justify-between">
      {/* Brand */}
      <Link href="/" className="font-semibold tracking-wide">
        ORAMA X
      </Link>

      {/* Main menu */}
      <nav className="flex items-center gap-8 text-[15px]">
        <Link href="/" className="hover:opacity-80">Home</Link>

        {/* Our Project (hover dropdown) */}
        <div className="relative group">
          <button
            className="hover:opacity-80 inline-flex items-center gap-1"
            aria-haspopup="menu"
          >
            Our Project <span>▾</span>
          </button>

          {/* Dropdown panel (opens on hover) */}
          <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100
                          transition-opacity duration-150
                          absolute left-1/2 -translate-x-1/2 mt-2
                          w-56 rounded-xl border border-black/10 bg-slate-900 text-white shadow-xl p-2">
            <Link href="/detector" className="block px-3 py-2 rounded-lg hover:bg-white/10">Exoplanet Detector</Link>
            <Link href="/our-project/our-challenge" className="block px-3 py-2 rounded-lg hover:bg-white/10">Our Challenge</Link>
            <Link href="/our-project/our-resources" className="block px-3 py-2 rounded-lg hover:bg-white/10">Our Resources</Link>
          </div>
        </div>

        <Link href="/our-team" className="hover:opacity-80">Our Team</Link>
        <Link href="/contact-us" className="hover:opacity-80">Contact Us</Link>
      </nav>
    </div>
  );
}
