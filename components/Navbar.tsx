"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Navbar() {
  useEffect(() => {
    const holder = document.querySelector<HTMLDivElement>("#ox-nav .has-sub");
    if (!holder) return;

    const btn = holder.querySelector<HTMLAnchorElement>("a.our-project");
    const menu = holder.querySelector<HTMLDivElement>(".submenu");
    if (!btn || !menu) return;

    let open = false;

    const toggleMenu = (ev: MouseEvent) => {
      ev.preventDefault(); // ❗ αποτρέπει την πλοήγηση
      open = !open;
      (menu as HTMLElement).style.display = open ? "block" : "none";
    };

    const onDocClick = (ev: MouseEvent) => {
      if (open && !holder.contains(ev.target as Node)) {
        (menu as HTMLElement).style.display = "none";
        open = false;
      }
    };

    btn.addEventListener("click", toggleMenu);
    document.addEventListener("click", onDocClick);

    return () => {
      btn.removeEventListener("click", toggleMenu);
      document.removeEventListener("click", onDocClick);
    };
  }, []);

  return (
    <div id="ox-nav">
      <div className="wrap">
        <Link href="/" className="brand" aria-label="Orama X home">
          <img src="/logos/oramax-logo.png" alt="" />
          <strong>ORAMA X</strong>
        </Link>

        <nav className="menu" aria-label="Main">
          <Link href="/">Home</Link>

          <div className="has-sub relative">
            <a href="#" className="our-project">
              Our Project <span className="caret">▾</span>
            </a>
            <div className="submenu absolute bg-[#0b0e1a] rounded-md shadow-lg mt-2 hidden" role="menu">
              <Link href="/our-project/exoplanet-detector" role="menuitem" className="block px-4 py-2 hover:bg-slate-800">
                Exoplanet Detector
              </Link>
              <Link href="/our-project/our-challenge" role="menuitem" className="block px-4 py-2 hover:bg-slate-800">
                How it works?
              </Link>
              <Link href="/our-project/our-resources" role="menuitem" className="block px-4 py-2 hover:bg-slate-800">
                Our Resources
              </Link>
            </div>
          </div>

          <Link href="/our-team">Our Team</Link>
        </nav>
      </div>
    </div>
  );
}
