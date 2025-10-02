// app/page.tsx
export default function HomePage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center">
      <div className="relative w-full h-[640px]">
        {/* GIF */}
        <img
          src="/images/main.gif"
          alt="Exoplanet Predictor"
          className="absolute inset-0 w-full h-full object-cover rounded-2xl shadow-2xl"
        />

        {/* Overlay button κάτω από το κείμενο DETECTOR */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Χώρος για να εμφανιστεί κάτω από το κείμενο */}
          <div className="mt-48 md:mt-64">
            <a
              href="/our-project"
              className="
                relative inline-block select-none
                px-14 py-6
                text-2xl font-extrabold uppercase tracking-wide text-white
                rounded-2xl
                bg-gradient-to-b from-sky-400 to-blue-600
                shadow-[0_12px_0_0_#1e3a8a,0_20px_30px_rgba(0,0,0,0.35)]
                transition-transform duration-150
                hover:translate-y-[1px] hover:shadow-[0_10px_0_0_#1e3a8a,0_16px_24px_rgba(0,0,0,0.3)]
                active:translate-y-[4px] active:shadow-[0_6px_0_0_#1e3a8a,0_10px_16px_rgba(0,0,0,0.25)]
              "
            >
              GET STARTED
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
