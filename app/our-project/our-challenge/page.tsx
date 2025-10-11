// app/our-project/our-challenge/page.tsx
export const metadata = {
  title: "How it works? — Orama X",
  description:
    "Step-by-step manual explaining how Orama X detects and vets exoplanets using AI/ML tools and NASA datasets.",
};

export default function OurChallengePage() {
  return (
    <main
      className="relative min-h-screen bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/images/challenge.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 space-y-10 prose prose-invert">
        <h1 className="text-4xl md:text-6xl font-bold text-center mb-10">
          How it works?
        </h1>

        <section>
          <h2>1) Before you start</h2>
          <ul>
            <li><b>Browser:</b> Use a modern browser (Chrome, Edge, Firefox, Safari). Keep a single tab active when running detections.</li>
            <li><b>Data access:</b> Orama X fetches light curves and metadata from MAST/SPOC and can query TESSCut and Gaia DR3.</li>
            <li><b>Terminology:</b> Light curve = Flux vs time; Phase folded = folded on candidate period; BLS = Box Least Squares; Vetting = checks before confirming a planet; P(planet) = AI classifier probability.</li>
          </ul>
        </section>

        <section>
          <h2>2) Detection panel overview</h2>
          <p>
            The main panel lets you choose a source, configure preprocessing, run
            a period search, and inspect candidates. Use <b>Fetch &amp; Detect</b> to
            download data, apply filters, and search for transit signals.
          </p>
        </section>

        <section>
          <h2>3) Single-target workflow</h2>
          <ol>
            <li>Enter target ID (TIC / EPIC / Kepler) and keep Mission = auto.</li>
            <li>Choose preprocessing: quality mask ON, outlier σ = 5, detrend = flatten.</li>
            <li>Enable centroid vetting and Gaia neighbors for contamination checks.</li>
            <li>Set thresholds (p = 0.5–0.8, centroid σ thr = 3.0, Gaia radius = 60″).</li>
            <li>Click <b>Fetch &amp; Detect</b> to run the search, then inspect candidates visually.</li>
            <li>Check metrics like SNR, ΔBIC, Odd/Even Δ, Secondary?, and Centroid.</li>
            <li>Fit the transit with <b>batman</b>, review parameters, and export vetted results.</li>
          </ol>
        </section>

        <section>
          <h2>4) Batch workflow</h2>
          <p>
            Analyze multiple targets using the same settings. Paste TICs/EPICs in
            <b>Bulk</b> mode, configure global parameters, run sequentially, and export
            results (all or vetted only).
          </p>
        </section>

        <section>
          <h2>5) Custom light curves</h2>
          <p>
            Upload TXT/CSV files with at least <code>time</code> and <code>flux</code>
            columns. Configure detrending and vetting as usual, then run detection and
            export.
          </p>
        </section>

        <section>
          <h2>6) AI / ML tools</h2>
          <ul>
            <li><b>Classification:</b> Each candidate receives a P(planet) score.</li>
            <li><b>Explainability:</b> “Explain prediction” highlights top contributing features (depth, duration, SNR, etc.).</li>
            <li><b>Retraining:</b> Upload labeled CSVs and click “Train new model” to fit a custom classifier and view metrics (F1, PR AUC, confusion matrix).</li>
          </ul>
        </section>

        <section>
          <h2>7) Gaia DR3 Neighbors panel</h2>
          <p>
            Shows nearby Gaia sources (sep, dx, dy, Gmag, BP−RP, RUWE). Use this to
            assess contamination and confirm centroid results.
          </p>
        </section>

        <section>
          <h2>8) Candidates table</h2>
          <p>
            Review each candidate’s period, duration, depth, power, P(planet), SNR,
            ΔBIC, odd/even Δ, and centroid status before confirming as a planet.
          </p>
        </section>

        <section>
          <h2>9) Export & reproducibility</h2>
          <p>
            Use <b>Export CSV</b>, <b>Export Vetted CSV</b>, and
            <b>Download PDF report</b> to save your analyses. Always record mission,
            detrending, thresholds, and model version for reproducibility.
          </p>
        </section>

        <section>
          <h2>10) Troubleshooting & best practices</h2>
          <ul>
            <li><b>No candidates?</b> Increase k peaks or relax σ clip.</li>
            <li><b>Spurious periods?</b> Tighten quality mask and verify by eye.</li>
            <li><b>Centroid fails?</b> Reduce Gaia radius and recheck neighbors.</li>
            <li><b>AI over-confident?</b> Raise planet threshold or review explanations.</li>
          </ul>
        </section>

        <section>
          <h2>11) Quick recipes</h2>
          <ul>
            <li><b>Single bright TESS target:</b> Fetch → Detect → Fit → Verify → Export.</li>
            <li><b>Batch analysis:</b> Bulk mode → run → Export Vetted CSV.</li>
            <li><b>Custom data:</b> Upload → Detect → Fit → Explain → Export.</li>
          </ul>
        </section>

        <section>
          <h2>12) Sensible thresholds</h2>
          <p>
            p = 0.5 (exploratory) / 0.8 (high purity), Centroid σ thr = 3.0, Gaia radius = 60″, k peaks = 3 (quick) / 5–10 (deep search).
          </p>
        </section>

        <section>
          <h2>Final note</h2>
          <p>
            Orama X enables human-AI collaboration for exoplanet discovery. Always
            combine AI probabilities with physical vetting (centroid, Gaia neighbors,
            odd/even tests, ΔBIC) and visual inspection before confirming a planet.
          </p>
        </section>
      </div>
    </main>
  );
}
