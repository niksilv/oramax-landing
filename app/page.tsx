// app/page.tsx
export default function HomePage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center">
      <div className="relative w-full max-w-3xl mx-auto">
        {/* GIF */}
        <img
          src="/images/main.gif"
          alt="Exoplanet Predictor"
          className="block w-full h-auto rounded-xl"
        />

        {/* GET STARTED κουμπί */}
        <a
          href="/our-project"
          className="
            absolute left-1/2 -translate-x-1/2
            top-[65%]
            px-12 md:px-16 py-5 md:py-6
            text-white text-xl md:text-2xl font-bold tracking-wide
            rounded-md
            bg-blue-600 hover:bg-blue-700
            shadow-lg
            transition-transform transition-colors
            active:translate-y-[2px]
          "
        >
          GET STARTED
        </a>
      </div>
    </main>
  );
}
