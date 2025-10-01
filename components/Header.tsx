import React from "react";
import Navbar from "./Navbar";

export default function Header() {
  return (
    <header className="w-full border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <Navbar />
      </div>
    </header>
  );
}
