// app/page.tsx
export default function HomePage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center">
      <div className="flex flex-col items-center space-y-10">
        {/* GIF με σταθερές διαστάσεις */}
        <img
          src="/images/main.gif"
          alt="Exoplanet Predictor"
          width={960}
          height={640}
          className="rounded-xl shadow-2xl object-contain"
        />

        {/* GET STARTED κουμπί */}
        <a
          href="/our-project"
          className="
            inline-block
            px-10 py-4
            text-lg font-semibold text-white
            rounded-full
            bg-gradient-to-r from-sky-500 to-blue-600
            shadow-lg shadow-blue-800/30
            hover:from-sky-400 hover:to-blue-500
            active:scale-95
            transition-all duration-200
          "
        >
          Get Started
        </a>
      </div>
    </main>
  );
}
