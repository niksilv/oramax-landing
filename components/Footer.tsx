import React from "react";

export default function Footer() {
  return (
    <footer className="border-t border-black/10">
      <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-slate-600">
        © {new Date().getFullYear()} Orama X — All rights reserved.
      </div>
    </footer>
  );
}
