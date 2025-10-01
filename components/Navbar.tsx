// components/Header.tsx
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto flex justify-between items-center py-4">
        <div className="font-bold text-lg">ORAMA X</div>
        <ul className="flex space-x-8">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li
            className="relative group"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            <button className="flex items-center">
              Our Project <span className="ml-1">▼</span>
            </button>
            {open && (
              <ul className="absolute top-full left-0 mt-2 bg-black text-white rounded-lg shadow-lg py-2 w-48">
                <li>
                  <Link
                    href="/exoplanet-detector"
                    className="block px-4 py-2 hover:bg-gray-800"
                  >
                    Exoplanet Detector
                  </Link>
                </li>
                <li>
                  <Link
                    href="/our-project/our-challenge"
                    className="block px-4 py-2 hover:bg-gray-800"
                  >
                    Our Challenge
                  </Link>
                </li>
                <li>
                  <Link
                    href="/our-project/our-resources"
                    className="block px-4 py-2 hover:bg-gray-800"
                  >
                    Our Resources
                  </Link>
                </li>
              </ul>
            )}
          </li>
          <li>
            <Link href="/our-team">Our Team</Link>
          </li>
          <li>
            <Link href="/contact">Contact Us</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
