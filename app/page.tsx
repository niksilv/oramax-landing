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

          {/* Image column wrapped in a 1×1 table (transparent border) */}
          <div className="w-full flex justify-center">
            <div className="mx-auto">
              <table
                className="
                  border-8 border-transparent      /* transparent “frame” για εύκολο sizing */
                  mx-auto
                  w-[640px] md:w-[780px] lg:w-[880px]  /* ← προσαρμόζεις μέγεθος GIF εδώ */
                "
              >
                <tbody>
                  <tr>
                    <td className="relative p-0 align-middle">
                      {/* GIF γεμίζει το κελί */}
                      <img
                        src="/images/main.gif"
                        alt="Exoplanet Predictor"
                        className="block w-full h-auto rounded-xl"
                      />

                      {/* Μεγάλο 3D CTA στο κέντρο του GIF, λίγο κάτω από τον τίτλο */}
                      <a
                        href="https://www.oramax.space/our-project/exoplanet-detector"
                        aria-label="Open Exoplanet Detector"
                        className="
                          absolute left-1/2 -translate-x-1/2
                          top-[62%] md:top-[60%]           /* ↑ ρύθμισε % για πιο πάνω/κάτω */
                          select-none
                          px-12 md:px-14 py-4 md:py-4.5
                          text-white text-lg md:text-xl font-semibold tracking-wider
                          rounded-2xl
                          bg-gradient-to-b from-blue-500 to-blue-700
                          shadow-[0_14px_32px_rgba(30,58,138,0.5)]
                          ring-1 ring-white/15
                          hover:from-blue-450 hover:to-blue-650
                          active:translate-y-[1px]
                          transition-[transform,colors] duration-150
                        "
                      >
                        GET STARTED
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          {/* /Image column */}
        </div>
      </div>
    </section>
  );
}
