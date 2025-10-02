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
      </div>
    </main>
  );
}
