"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [projOpen, setProjOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const navLink =
    "px-3 py-2 text-sm font-medium hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0c0f1a] focus:ring-white rounded-md";

  const isActive = (href: string) =>
    pathname === href ? "opacity-100" : "opacity-80";

  // Go to Our Project page when clicking the main item
  const goOurProject = () => router.push("/our-project");

  return (
    <header className="sticky top-0 z-50 bg-[#0c0f1a] text-slate-100">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-wide">
            ORAMA X
          </Link>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-6">
            <li>
              <Link href="/" className={`${navLink} ${isActive("/")}`}>
                Home
              </Link>
            </li>

            {/* Our Project with hover dropdown + click navigates */}
            <li
              className="relative group"
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
                Our Project
                <span className="ml-1 select-none">▾</span>
              </button>

              {/* Dropdown */}
              {(projOpen) && (
                <div className="absolute left-0 top-full mt-2 w-64 rounded-xl bg-[#0b0e18] shadow-xl ring-1 ring-black/10">
                  <ul className="py-2 text-[15px]">
                    <li>
                      <Link
                        href="/detector"
                        className="block px-4 py-2 hover:bg-white/5"
                      >
                        Exoplanet Detector
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/our-project/our-challenge"
                        className="block px-4 py-2 hover:bg-white/5"
                      >
                        Our Challenge
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/our-project/our-resources"
                        className="block px-4 py-2 hover:bg-white/5"
                      >
                        Our Resources
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </li>

            <li>
              <Link
                href="/our-team"
                className={`${navLink} ${isActive("/our-team")}`}
              >
                Our Team
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className={`${navLink} ${isActive("/contact")}`}
              >
                Contact Us
              </Link>
            </li>
            <li>
              <Link
                href="/detector"
                className={`${navLink} ${isActive("/detector")}`}
              >
                Detector
              </Link>
            </li>
          </ul>

          {/* Mobile button */}
          <button
            aria-label="Toggle menu"
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-white/5"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              {mobileOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0c0f1a]">
          <ul className="mx-auto max-w-7xl px-4 py-3 space-y-1">
            <li>
              <Link href="/" className="block px-3 py-2 rounded-md hover:bg-white/5">
                Home
              </Link>
            </li>

            <li className="rounded-md">
              <button
                onClick={goOurProject}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-white/5 inline-flex items-center justify-between"
              >
                <span>Our Project</span>
                <span className="ml-2">▸</span>
              </button>
              <ul className="mt-1 ml-3 space-y-1">
                <li>
                  <Link href="/detector" className="block px-3 py-2 rounded-md hover:bg-white/5">
                    Exoplanet Detector
                  </Link>
                </li>
                <li>
                  <Link href="/our-project/our-challenge" className="block px-3 py-2 rounded-md hover:bg-white/5">
                    Our Challenge
                  </Link>
                </li>
                <li>
                  <Link href="/our-project/our-resources" className="block px-3 py-2 rounded-md hover:bg-white/5">
                    Our Resources
                  </Link>
                </li>
              </ul>
            </li>

            <li>
              <Link href="/our-team" className="block px-3 py-2 rounded-md hover:bg-white/5">
                Our Team
              </Link>
            </li>
            <li>
              <Link href="/contact" className="block px-3 py-2 rounded-md hover:bg-white/5">
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="/detector" className="block px-3 py-2 rounded-md hover:bg-white/5">
                Detector
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
