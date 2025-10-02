// app/page.tsx
export default function HomePage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-10 w-full">
        {/* GIF: full width, fixed height */}
        <div className="relative w-full h-[640px]">
          <img
            src="/images/main.gif"
            alt="Exoplanet Predictor"
            className="absolute inset-0 w-full h-full object-cover rounded-2xl shadow-2xl"
          />
        </div>

        {/* 3D GET STARTED button */}
        <a
          href="/our-project"
          className="
            relative inline-block select-none
            px-12 py-5 text-xl font-extrabold uppercase tracking-wide text-white
            rounded-2xl
            bg-gradient-to-b from-sky-400 to-blue-600
            shadow-[0_10px_0_0_#1e3a8a,0_18px_30px_rgba(0,0,0,0.35)]
            transition-transform duration-150
            hover:translate-y-[1px] hover:shadow-[0_9px_0_0_#1e3a8a,0_14px_22px_rgba(0,0,0,0.3)]
            active:translate-y-[4px] active:shadow-[0_6px_0_0_#1e3a8a,0_10px_16px_rgba(0,0,0,0.28)]
          "
          aria-label="Get Started"
        >
          GET STARTED
        </a>
      </div>
    </main>
  );
}
