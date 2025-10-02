// app/our-project/page.tsx
import BgHero from "@/components/BgHero";

export const metadata = {
  title: "Our Project — Orama X",
  description: "AI/ML pipeline for reliable, fast, and transparent exoplanet discovery.",
};

export default function ProjectPage() {
  return (
    <main className="min-h-[80vh]">
      {/* FULL-BLEED HERO (σπάει το container του layout για να πιάσει όλο το πλάτος) */}
      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
        <BgHero
          image="/images/project.jpg"   // public/images/project.jpg (lowercase, exact name!)
          title="Orama X — AI/ML for Exoplanet Discovery"
          subtitle="Our Project"
          fullscreen
        >
          <p className="mx-auto max-w-2xl text-base md:text-lg leading-7">
            We build a research-grade pipeline that turns TESS/Kepler light curves and
            Gaia context into <b>reliable exoplanet candidates</b> — faster vetting,
            transparent decisions, and exportable reports for scientific review.
          </p>
        </BgHero>
      </div>

      {/* CONTENT */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl space-y-14">
          {/* Value props */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-semibold">What we’re building</h2>
            <p className="mx-auto max-w-3xl text-slate-300">
              A cohesive, auditable system that <b>fetches</b>, <b>denoises</b>, <b>detects</b>,
              and <b>vets</b> exoplanet signals — combining classical BLS, modern CNN models,
              centroid checks, and Gaia neighbors.
            </p>
          </div>

          {/* 3 features */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-neutral-900/40 p-6">
              <h3 className="text-lg font-semibold mb-2">Accuracy</h3>
              <p className="text-sm text-slate-300">
                Statistical rigor, cross-checks (odd-even, depth stability), and Gaia-based
                contamination analysis reduce false positives.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-neutral-900/40 p-6">
              <h3 className="text-lg font-semibold mb-2">Speed</h3>
              <p className="text-sm text-slate-300">
                Efficient processing for thousands of light curves, streaming fetch, and
                responsive UI for interactive vetting.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-neutral-900/40 p-6">
              <h3 className="text-lg font-semibold mb-2">Reproducibility</h3>
              <p className="text-sm text-slate-300">
                Deterministic configs, versioned models, and one-click exports (CSV/PDF)
                for transparent reviews and follow-ups.
              </p>
            </div>
          </div>

          {/* Pipeline bullets */}
          <div className="prose prose-invert max-w-3xl mx-auto">
            <h3>Pipeline</h3>
            <ul>
              <li><b>Fetch &amp; Preprocess:</b> quality masks, outlier removal, detrending.</li>
              <li><b>Detection:</b> BLS &amp; CNN scoring to rank candidate periods.</li>
              <li><b>Vetting:</b> phase-folded plots, centroid consistency, Gaia neighbors.</li>
              <li><b>Reporting:</b> structured summaries &amp; artifacts for archiving.</li>
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
      </section>
    </main>
  );
}
