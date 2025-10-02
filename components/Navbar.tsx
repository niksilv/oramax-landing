"use client";

import React from "react";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = React.useState(false);
  const keepOpen = () => setOpen(true);
  const close = () => setOpen(false);

  return (
    <div className="flex items-center justify-between">
      {/* Brand */}
      <Link href="/" className="font-semibold tracking-wide text-slate-900">
        ORAMA X
      </Link>

      {/* Main menu */}
      <nav className="relative hidden md:flex items-center gap-10 text-[15px] text-slate-900">
        <Link href="/" className="hover:opacity-80">Home</Link>

        {/* Our Project (clickable + dropdown on hover) */}
        <div
          className="relative"
          onMouseEnter={keepOpen}
          onMouseLeave={close}
        >
          {/* το label είναι και link */}
          <Link
            href="/our-project"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-black/[0.04]"
            onFocus={keepOpen}
            onBlur={close}
          >
            Our Project <span aria-hidden>▾</span>
          </Link>

          {/* Dropdown panel */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 mt-2 w-64 rounded-2xl
                        border border-black/10 bg-[#0B0D16] text-white shadow-2xl p-2
                        transition-all duration-150
                        ${open ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-1"}`}
            onMouseEnter={keepOpen}
            onMouseLeave={close}
          >
            <Link
              href="/detector"
              className="block px-4 py-2 rounded-xl font-semibold hover:bg-white/10"
            >
              Exoplanet Detector
            </Link>
            <Link
              href="/our-project/our-challenge"
              className="block px-4 py-2 rounded-xl hover:bg-white/10"
            >
              Our Challenge
            </Link>
            <Link
              href="/our-project/our-resources"
              className="block px-4 py-2 rounded-xl hover:bg-white/10"
            >
              Our Resources
            </Link>
          </div>
        </div>

        <Link href="/our-team" className="hover:opacity-80">Our Team</Link>
        <Link href="/contact-us" className="hover:opacity-80">Contact Us</Link>
        <Link href="/detector" className="hover:opacity-80">Detector</Link>
      </nav>
    </div>
  );
}
