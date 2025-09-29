"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="ox-topbar">
      <nav className="ox-nav">
        <Link href="/" className="ox-a ox-brand">
          <img src="/logos/oramax-logo.png" alt="Orama X" />
          <strong>ORAMA X</strong>
        </Link>

        <div className="ox-menu">
          <Link href="/" className="ox-a">Home</Link>

          <div className="ox-dd">
            <button className="ox-a ox-ddbtn" onClick={() => setOpen(v => !v)}>
              Our Project ▾
            </button>
            <div className="ox-ddm" style={{ display: open ? "block" : "none" }}>
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
