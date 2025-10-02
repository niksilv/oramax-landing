// app/our-project/page.tsx
import BgHero from "@/components/BgHero";

export const metadata = {
  title: "Our Project — Orama X",
  description: "Exoplanet Detector: Project overview",
};

export default function ProjectPage() {
  return (
    <main className="min-h-[80vh]">
      {/* Fullscreen hero με project.jpg */}
      <BgHero
        image="/images/project.jpg"
        title="Orama X — AI/ML for Exoplanet Discovery"
        subtitle="Our Project"
        fullscreen
      >
        <p className="max-w-3xl mx-auto text-base md:text-lg leading-7">
          <b>Orama X</b> is a research-grade pipeline that transforms raw
          photometry from <b>NASA’s TESS/Kepler missions</b> and astrometry from <b>Gaia</b>
          into <b>reliable exoplanet candidates</b>. It combines <b>signal processing</b>,
          <b>BLS</b> (Box Least Squares), and <b>modern ML models (CNN)</b> to analyze thousands
          of light curves rapidly—reducing manual vetting and increasing confidence.
        </p>
      </BgHero>

      <div className="max-w-6xl mx-auto px-4 py-16 space-y-10">
        <section className="prose prose-invert max-w-3xl mx-auto">
          <p>
            Our pipeline is built around three principles:
            <b> accuracy</b> (statistical rigor and cross-checks),
            <b> speed</b> (efficient compute and streaming fetch),
            and <b>reproducibility</b> (deterministic settings and exportable reports).
            Every decision—detrending, peak selection, thresholds—is auditable.
          </p>

          <h2>Core workflow</h2>
          <ul>
            <li>
              <b>Fetch &amp; Preprocess:</b> ingest mission data, apply quality masks,
              outlier removal, and configurable detrending.
            </li>
            <li>
              <b>Detection:</b> run BLS or CNN to locate periodic transits and rank candidates.
            </li>
            <li>
              <b>Vetting:</b> Gaia-based neighbor checks, centroid consistency,
              and phase-folded diagnostics to filter false positives.
            </li>
            <li>
              <b>Reporting:</b> one-click CSV exports and printable PDF vetting reports.
            </li>
          </ul>

          <p>
            By unifying classic methods with ML and Gaia context, Orama X enables
            <b> fast, transparent, and verifiable</b> exoplanet discovery—ready for
            collaborative review and follow-up within the NASA ecosystem.
          </p>
        </section>
      </div>
    </main>
  );
}
