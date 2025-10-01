import React from "react";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-6 text-sm opacity-75">
        © {new Date().getFullYear()} Orama X — All rights reserved.
      </div>
    </footer>
  );
}
