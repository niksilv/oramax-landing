// components/BgHero.tsx
type Props = {
  image: string;          // π.χ. "/images/project.jpg"
  title: string;          // π.χ. "Project"
  subtitle?: string;      // π.χ. "Exoplanet"
  children?: React.ReactNode; // προαιρετικό extra κείμενο/κουμπιά
};

export default function BgHero({ image, title, subtitle, children }: Props) {
  return (
    <section
      className="relative min-h-[70vh] w-full overflow-hidden rounded-xl"
      style={{
        backgroundImage: `url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      aria-label={title}
    >
      {/* σκοτεινό overlay για αναγνωσιμότητα */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,8,20,.55),rgba(5,8,20,.75))]" />

      {/* περιεχόμενο */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16 text-center text-slate-100">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 text-xl md:text-2xl text-slate-200/90">{subtitle}</p>
        )}
        {children && <div className="mt-8 text-slate-200/90">{children}</div>}
      </div>
    </section>
  );
}
