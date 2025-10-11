"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <div id="ox-nav">
      <div className="wrap">
        <Link href="/" className="brand" aria-label="Orama X home">
          <img src="/logos/oramax-logo.png" alt="" />
          <strong>ORAMA X</strong>
        </Link>

        <nav className="menu" aria-label="Main">
          <Link href="/">Home</Link>

          {/* Our Project με hover για submenu */}
          <div className="has-sub relative group">
            <a
              href="#"
              className="our-project inline-flex items-center"
              aria-haspopup="true"
              aria-expanded="false"
              onClick={(e) => e.preventDefault()}
            >
              Our Project <span className="caret ml-1">▾</span>
            </a>

            <div
              className="
                submenu absolute left-0 mt-2 min-w-[220px]
                bg-[#0b0e1a] rounded-md shadow-lg border border-slate-800
                hidden group-hover:block group-focus-within:block
                z-50
              "
              role="menu"
            >
              <Link
                href="/our-project/exoplanet-detector"
                role="menuitem"
                className="block px-4 py-2 hover:bg-slate-800"
              >
                Exoplanet Detector
              </Link>
              <Link
                href="/our-project/our-challenge"
                role="menuitem"
                className="block px-4 py-2 hover:bg-slate-800"
              >
                How it works?
              </Link>
              {/* <Link
                href="/our-project/our-resources"
                role="menuitem"
                className="block px-4 py-2 hover:bg-slate-800"
              >
                Our Resources
              </Link> */}
            </div>
          </div>

          <Link href="/our-team">Our Team</Link>
        </nav>
      </div>
    </div>
  );
}
