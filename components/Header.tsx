"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Header() {
  const [projOpen, setProjOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const navLink =
    "px-3 py-2 text-sm font-medium hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0c0f1a] focus:ring-white rounded-md";

  const isActive = (href: string) =>
    pathname === href ? "opacity-100" : "opacity-80";

  const goOurProject = () => router.push("/our-project");

  return (
    <header
      id="orama-topbar"
      className="fixed top-0 left-0 right-0 z-50 bg-[#1a1e2a] text-slate-200 border-b border-white/10"
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="h-12 flex items-center justify-between">
          {/* Brand (μικρό logo + κείμενο) */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img
              src="/logos/oramax-logo.png" /* βεβαιώσου ότι υπάρχει στο /public/logos/ */
              alt="Orama X"
              className="h-6 w-auto block"   /* <-- σταθερό μικρό ύψος */
              loading="eager"
            />
            <strong className="text-sm tracking-wide">ORAMA X</strong>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className={`${navLink} ${isActive("/")}`}>
              Home
            </Link>

            {/* Our Project + dropdown (hover) | click -> /our-project */}
            <div
              className="relative"
              onMouseEnter={() => setProjOpen(true)}
              onMouseLeave={() => setProjOpen(false)}
            >
              <button
                type="button"
                onClick={goOurProject}
                className={`${navLink} inline-flex items-center ${isActive(
                  "/our-project"
                )}`}
              >
                Our Project <span className="ml-1">▾</span>
              </button>

              {projOpen && (
                <div className="absolute left-0 top-[110%] w-64 rounded-xl bg-[#13172a] border border-white/10 shadow-xl py-2">
                  <Link
                    href="/our-project/exoplanet-detector"
                    className="block px-4 py-2 hover:bg-white/5"
                  >
                    Exoplanet Detector
                  </Link>
                  <Link
                    href="/our-project/our-challenge"
                    className="block px-4 py-2 hover:bg-white/5"
                  >
                    Our Challenge
                  </Link>
                  <Link
                    href="/our-project/our-resources"
                    className="block px-4 py-2 hover:bg-white/5"
                  >
                    Our Resources
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/our-team"
              className={`${navLink} ${isActive("/our-team")}`}
            >
              Our Team
            </Link>

            <Link
              href="/contact-us"
              className={`${navLink} ${isActive("/contact-us")}`}
            >
              Contact Us
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
