"use client";

import React from "react";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = React.useState(false);
  const keepOpen = () => setOpen(true);
  const close = () => setOpen(false);

  return (
    <div className="flex items-center justify-between">
      <Link href="/" className="font-semibold tracking-wide">
        ORAMA X
      </Link>

      <nav className="relative flex items-center gap-8 text-[15px]">
        <Link href="/" className="hover:opacity-80">Home</Link>

        <div
          className="relative"
          onMouseEnter={keepOpen}
          onMouseLeave={close}
        >
          <Link
            href="/our-project"
            className="inline-flex items-center gap-1 hover:opacity-80"
            onFocus={keepOpen}
            onBlur={close}
          >
            Our Project <span aria-hidden>▾</span>
          </Link>

          <div
            className={`absolute left-1/2 -translate-x-1/2 mt-2 w-56 rounded-xl
                         border border-white/10 bg-neutral-900 text-white shadow-xl p-2
                         transition-opacity duration-150
                         ${open ? "opacity-100 visible" : "opacity-0 invisible"}`}
            onMouseEnter={keepOpen}
            onMouseLeave={close}
          >
            <Link href="/detector" className="block px-3 py-2 rounded-lg hover:bg-white/10">Exoplanet Detector</Link>
            <Link href="/our-project/our-challenge" className="block px-3 py-2 rounded-lg hover:bg-white/10">Our Challenge</Link>
            <Link href="/our-project/our-resources" className="block px-3 py-2 rounded-lg hover:bg-white/10">Our Resources</Link>
          </div>
        </div>

        <Link href="/our-team" className="hover:opacity-80">Our Team</Link>
        <Link href="/contact-us" className="hover:opacity-80">Contact Us</Link>
        <Link href="/detector" className="hover:opacity-80">Detector</Link>
      </nav>
    </div>
  );
}
