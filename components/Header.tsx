import React from "react";
import Navbar from "./Navbar";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-black/10 bg-white/90 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <Navbar />
      </div>
    </header>
  );
}
