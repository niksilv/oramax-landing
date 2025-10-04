"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Navbar() {
  const router = useRouter();

  // Click στο Our Project -> πηγαίνει στη σελίδα /our-project
  const goOurProject = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    // Αν το submenu είναι κλειστό σε touch, θα ανοιχτεί με CSS/JS – στο desktop αφήνουμε το click να πλοηγεί
    e.preventDefault();
    router.push("/our-project");
  };

  // Προαιρετικό: μικρό helper ώστε σε touch συσκευές ένα πρώτο tap να ανοίγει το submenu και δεύτερο tap να πλοηγεί
  useEffect(() => {
    const holder = document.querySelector<HTMLDivElement>("#ox-nav .has-sub");
    if (!holder) return;

    const btn = holder.querySelector<HTMLAnchorElement>("a.our-project");
    const menu = holder.querySelector<HTMLDivElement>(".submenu");
    if (!btn || !menu) return;

    let open = false;
    const isTouch = matchMedia("(pointer: coarse)").matches;

    const onClick = (ev: MouseEvent) => {
      if (!isTouch) return; // στο desktop δεν κάνουμε override
      if (!open) {
        ev.preventDefault();
        menu.style.display = "block";
        open = true;
      } else {
        // δεύτερο tap: αφήνουμε να πλοηγεί
      }
    };

    const onDoc = (ev: MouseEvent) => {
      if (!isTouch || !open) return;
      if (!holder.contains(ev.target as Node)) {
        (menu as HTMLElement).style.display = "none";
        open = false;
      }
    };

    btn.addEventListener("click", onClick);
    document.addEventListener("click", onDoc);
    return () => {
      btn.removeEventListener("click", onClick);
      document.removeEventListener("click", onDoc);
    };
  }, []);

  return (
    <div id="ox-nav">
      <div className="wrap">
        <Link href="/" className="brand" aria-label="Orama X home">
          {/* Βεβαιώσου ότι υπάρχει στο /public/logos/oramax-logo.png */}
          <img src="/logos/oramax-logo.png" alt="" />
          <strong>ORAMA X</strong>
        </Link>

        <nav className="menu" aria-label="Main">
          <Link href="/">Home</Link>

          <div className="has-sub">
            <a href="/our-project" className="our-project" onClick={goOurProject}>
              Our Project <span className="caret">▾</span>
            </a>
            <div className="submenu" role="menu">
              <Link href="/our-project/exoplanet-detector" role="menuitem">
                Exoplanet Detector
              </Link>
              <Link href="/our-project/our-challenge" role="menuitem">
                How it works?
              </Link>
              <Link href="/our-project/our-resources" role="menuitem">
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
