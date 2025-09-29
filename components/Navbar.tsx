"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setOpen(false), [pathname]);

  function openMenu() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function closeMenuDelayed() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 180);
  }

  return (
    <div className="ox-topbar">
      <nav className="ox-nav">
        {/* Brand με logo + τίτλο */}
        <Link href="/" className="ox-a ox-brand" aria-label="Orama X home">
          <Image
            src="/logos/oramax-logo.png"
            alt="Orama X Logo"
            width={256}
            height={256}
            className="!h-12 !w-12 shrink-0 object-contain"
            style={{ height: 48, width: 48 }}
            priority
          />
          <strong className="ml-2">ORAMA X</strong>
        </Link>

        <div className="ox-menu">
          <Link href="/" className="ox-a">Home</Link>

          <div
            className="ox-dd"
            onMouseEnter={openMenu}
            onMouseLeave={closeMenuDelayed}
            onFocus={openMenu}
            onBlur={closeMenuDelayed}
          >
            {/* Click => /our-project, Hover => ανοίγει submenu */}
            <Link href="/our-project" className="ox-a ox-ddbtn">
              Our Project ▾
            </Link>

            <div
              className="ox-ddm"
              style={{ display: open ? "block" : "none" }}
              onMouseEnter={openMenu}
              onMouseLeave={closeMenuDelayed}
            >
              <Link href="/detector" className="ox-a">Exoplanet Detector</Link>
              <Link href="/our-project/our-challenge" className="ox-a">Our Challenge</Link>
              <Link href="/our-project/our-resources" className="ox-a">Our Resources</Link>
            </div>
          </div>

          <Link href="/our-team" className="ox-a">Our Team</Link>
          <Link href="/contact-us" className="ox-a">Contact Us</Link>
        </div>
      </nav>
    </div>
  );
}
