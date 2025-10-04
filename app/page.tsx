// app/page.tsx
export default function HomePage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center">
      <div className="relative w-full h-[640px]">
        {/* GIF μόνο του */}
        <img
          src="/images/main.gif"
          alt="Exoplanet Predictor"
          className="absolute inset-0 w-full h-full object-cover rounded-2xl shadow-2xl"
        />

        {/* Κείμενο στο κέντρο του gif */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <h2 className="text-white text-3xl md:text-5xl font-bold text-center drop-shadow-2xl">
            A World Away: Hunting for Exoplanets with AI
          </h2>
        </div>
      </div>
    </main>
  );
}
