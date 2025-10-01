export default function Footer() {
  return (
    <footer className="bg-[#0c0f1a] text-slate-200">
      {/* ⚠️ Κανένα border εδώ */}
      <div className="mx-auto max-w-7xl px-4 py-4 text-center text-sm">
        © {new Date().getFullYear()} Orama X — All rights reserved.
      </div>
    </footer>
  );
}
