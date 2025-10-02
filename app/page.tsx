export default function Page() {
  return (
    <section className="block w-full max-w-full h-auto rounded-xl">
      <div className="mx-auto max-w-6xl px-4 pt-10 pb-16 hero-gradient flex flex-col items-center gap-12">
        
        {/* GIF στο μισό μέγεθος με overlay κουμπί */}
        <div className="relative w-full max-w-3xl mx-auto">
          <img
            src="/images/main.gif"
            alt="Exoplanet Predictor"
            className="block w-full h-auto rounded-xl"
          />

          {/* Μεγάλο 3D κουμπί */}
          <a
            href="https://www.oramax.space/our-project/exoplanet-detector"
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

        {/* Κείμενο κάτω από το GIF */}
        <div className="max-w-3xl text-left">
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
      </div>
    </section>
  );
}
