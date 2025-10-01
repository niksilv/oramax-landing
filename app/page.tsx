export default function Page() {
  return (
    <section className="block w-full max-w-full h-auto rounded-xl">
      <div className="mx-auto max-w-6xl px-4 pt-10 pb-16 hero-gradient">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Text column (narrower for readability) */}
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
              Orama X — AI/ML for Exoplanet Discovery
            </h1>

            <p className="mt-5 text-slate-300 leading-relaxed">
              <b>Orama X</b> is a research-grade pipeline that transforms raw
              photometry from <b>NASA’s TESS/Kepler missions</b> and
              astrometry from <b>Gaia</b> into <b>reliable exoplanet candidates</b>.
              It combines <b>signal processing</b>, <b>BLS</b> (Box Least Squares),
              and <b>modern ML models (CNN)</b> to analyze thousands of light
              curves rapidly—reducing manual vetting and increasing confidence.
            </p>

            <p className="mt-4 text-slate-300 leading-relaxed">
              Our pipeline is built around three principles:
              <b> accuracy</b> (statistical rigor and cross-checks),
              <b> speed</b> (efficient compute and streaming fetch),
              and <b>reproducibility</b> (deterministic settings and exportable reports).
              Every decision—detrending, peak selection, thresholds—is auditable.
            </p>

            <div className="mt-4 text-slate-300 leading-relaxed">
              <p className="font-semibold">Core workflow</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>
                  <b>Fetch &amp; Preprocess:</b> ingest mission data, apply quality masks,
                  outlier removal, and configurable <b>detrending</b>.
                </li>
                <li>
                  <b>Detection:</b> run <b>BLS</b> or <b>CNN</b> to locate periodic transits and rank candidates.
                </li>
                <li>
                  <b>Vetting:</b> Gaia-based neighbor checks, centroid consistency,
                  and <b>phase-folded</b> diagnostics to filter false positives.
                </li>
                <li>
                  <b>Reporting:</b> one-click <b>CSV</b> exports and printable <b>PDF</b> vetting reports.
                </li>
              </ul>
            </div>

            <p className="mt-4 text-slate-300 leading-relaxed">
              By unifying classic methods with ML and Gaia context, Orama X enables
              <b> fast, transparent, and verifiable</b> exoplanet discovery—ready for
              collaborative review and follow-up within the NASA ecosystem.
            </p>
          </div>

          {/* Image column with centered overlay button */}
<div className="w-full flex justify-center">
  <div className="relative w-full max-w-xl mx-auto">
    <img
      src="/images/main.gif"
      alt="Space background"
      className="block w-full h-auto rounded-xl"
    />
    <div className="absolute inset-0 flex items-center justify-center">
      <a
        href="https://www.oramax.space/our-project/exoplanet-detector"
        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg shadow-lg"
      >
        GET STARTED
      </a>
    </div>
  </div>
</div>

        </div>
      </div>
    </section>
  );
}
