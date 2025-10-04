// app/page.tsx
export default function HomePage() {
  return (
    <main className="relative min-h-[80vh] flex items-center justify-center">
      {/* GIF */}
      <div className="relative w-full h-[640px]">
        <img
          src="/images/main.gif"
          alt="Exoplanet Predictor"
          className="absolute inset-0 w-full h-full object-cover rounded-2xl shadow-2xl"
        />
      </div>

      {/* Φράση μπροστά από το gif (overlay πάνω στο main.gif) */}
      <div className="absolute top-[55%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
        <h2 className="text-white text-4xl md:text-5xl font-bold text-center drop-shadow-2xl">
          A World Away: Hunting for Exoplanets with AI
        </h2>
      </div>
    </main>
  );
}
