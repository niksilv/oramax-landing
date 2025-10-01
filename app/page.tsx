export default function Page() {
  return (
    <section className="block w-full max-w-full h-auto rounded-xl">
      <div className="mx-auto max-w-6xl px-4 pt-10 pb-16 hero-gradient flex flex-col items-center gap-12">
        
        {/* GIF πολύ μεγάλο με overlay κουμπί */}
        <div className="relative w-full max-w-6xl mx-auto">
          <img
            src="/images/main.gif"
            alt="Exoplanet Predictor"
            className="block w-full h-auto rounded-xl"
          />

          {/* Μεγάλο 3D κουμπί στο κέντρο */}
          <a
            href="https://www.oramax.space/our-project/exoplanet-detector"
            className="
              absolute left-1/2 -translate-x-1/2
              top-[65%]
              px-16 md:px-20 py-6 md:py-7
              text-white text-2xl md:text-3xl font-bold tracking-wide
              rounded-2xl
              bg-gradient-to-b from-blue-500 to-blue-700
              shadow-[0_20px_40px_rgba(30,58,138,0.6)]
              ring-2 ring-white/20
              hover:from-blue-400 hover:to-blue-600
              active:translate-y-[2px]
              transition-transform transition-colors
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
