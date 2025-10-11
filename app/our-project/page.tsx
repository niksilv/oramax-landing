// app/our-project/page.tsx

export const metadata = {
  title: "Our Project — Orama X",
  description: "AI/ML pipeline for reliable, fast, and transparent exoplanet discovery.",
};

export default function ProjectPage() {
  return (
    <main
      className="relative min-h-screen bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/images/project.jpg')" }}
    >
      {/* Overlay για καλύτερη αναγνωσιμότητα */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Περιεχόμενο */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 space-y-16">
        {/* Hero section */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold">
            Orama X — AI/ML for Exoplanet Discovery
          </h1>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-slate-200">
            We build a research-grade pipeline that transforms TESS/Kepler light
            curves and Gaia context into <b>reliable exoplanet candidates</b> —
            faster vetting, transparent decisions, and exportable reports for
            scientific review.
          </p>
        </div>

        {/* Τρία βασικά pillars */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-white/10 backdrop-blur p-6">
            <h3 className="text-xl font-semibold mb-2">Accuracy</h3>
            <p className="text-sm text-slate-200">
              Cross-checks (odd-even, depth stability) and Gaia-based neighbor
              analysis reduce false positives.
            </p>
          </div>
          <div className="rounded-xl bg-white/10 backdrop-blur p-6">
            <h3 className="text-xl font-semibold mb-2">Speed</h3>
            <p className="text-sm text-slate-200">
              Efficient processing of thousands of light curves with streaming
              fetch and responsive UI.
            </p>
          </div>
          <div className="rounded-xl bg-white/10 backdrop-blur p-6">
            <h3 className="text-xl font-semibold mb-2">Reproducibility</h3>
            <p className="text-sm text-slate-200">
              Deterministic configs, versioned models, and one-click exports
              (CSV/PDF) for transparent reviews.
            </p>
          </div>
        </div>

        {/* Pipeline bullets */}
        <div className="prose prose-invert max-w-3xl mx-auto">
          <h2>Pipeline</h2>
          <ul>
            <li>
              <b>Fetch &amp; Preprocess:</b> masks, outlier removal, detrending.
            </li>
            <li>
              <b>Detection:</b> BLS &amp; CNN scoring to rank candidate periods.
            </li>
            <li>
              <b>Vetting:</b> phase-folded plots, centroid consistency, Gaia neighbors.
            </li>
            <li>
              <b>Reporting:</b> structured summaries &amp; artifacts for archiving.
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="text-center">
          <a
            href="/detector"
            className="inline-block rounded-xl bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 active:translate-y-[1px]"
          >
            Try the Detector
          </a>
        </div>
      </div>
    </main>
  );
}
