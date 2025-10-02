import Head from "next/head";

export default function OurChallengePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 relative">
      <Head>
        <title>Orama X — Our Challenge</title>
        <meta name="description" content="AI/ML challenge: build robust exoplanet classifiers using open NASA datasets (TESS, Kepler, K2) and evaluate on new signals." />
      </Head>

      {/* Hero with background image */}
      <section className="relative isolate">
        <div
          className="absolute inset-0 -z-10 bg-center bg-cover"
          style={{ backgroundImage: "url('/challenge.jpg')" }}
          aria-hidden
        />
        <div className="absolute inset-0 -z-0 bg-gradient-to-b from-slate-900/70 via-slate-900/60 to-slate-950/95" />

        <div className="mx-auto max-w-5xl px-6 pt-28 pb-16 md:pt-36 md:pb-24">
          <p className="uppercase tracking-[0.2em] text-xs md:text-sm text-teal-300/90">Our Project</p>
          <h1 className="mt-3 text-3xl md:text-5xl font-bold leading-tight">
            Our Challenge
          </h1>
          <p className="mt-5 max-w-3xl text-base md:text-lg text-slate-200/90">
            Data from several different space-based exoplanet surveying missions have enabled discovery of thousands of new planets outside our solar system, but most of these exoplanets were identified manually. With advances in artificial intelligence and machine learning (AI/ML), it is possible to automatically analyze large sets of data collected by these missions to identify exoplanets. Your challenge is to create an AI/ML model that is trained on one or more of the open-source exoplanet datasets offered by NASA and that can analyze new data to accurately identify exoplanets. <span className="whitespace-nowrap">(Astrophysics Division)</span>
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/detector" className="inline-flex items-center rounded-2xl px-5 py-3 text-sm font-semibold ring-1 ring-white/15 bg-white/10 hover:bg-white/15 transition">
              Try the Detector
            </a>
            <a href="/our-project/our-resources" className="inline-flex items-center rounded-2xl px-5 py-3 text-sm font-semibold ring-1 ring-white/15 hover:bg-white/10 transition">
              See Our Resources
            </a>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-5xl px-6 py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-8">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6">
              <h2 className="text-xl md:text-2xl font-semibold">What you will build</h2>
              <p className="mt-3 text-slate-200/90">
                A robust, explainable classifier (or end-to-end pipeline) that ingests photometric time series and related context to determine whether a signal is a likely <em>exoplanet candidate</em>, a stellar eclipsing binary, or an instrumental false positive. The model should generalize across missions and targets, not just memorize training distributions.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6">
              <h2 className="text-xl md:text-2xl font-semibold">Open datasets</h2>
              <ul className="mt-3 list-disc pl-6 space-y-2 text-slate-200/90">
                <li><strong>TESS</strong> (Full-Frame Images & light curves), plus TIC / stellar parameters.</li>
                <li><strong>Kepler</strong> & <strong>K2</strong> labeled planet candidates / false positives.</li>
                <li><strong>Gaia DR3</strong> neighbors and astrometric context to detect contamination.</li>
              </ul>
              <p className="mt-3 text-sm text-slate-400">
                You may combine datasets and engineer cross-mission features. Document any filtering, detrending, and augmentation steps.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6">
              <h2 className="text-xl md:text-2xl font-semibold">Suggested approach</h2>
              <ol className="mt-3 list-decimal pl-6 space-y-2 text-slate-200/90">
                <li><strong>Preprocess</strong>: de-trend, remove systematics, phase-fold candidates, and handle gaps/outliers.</li>
                <li><strong>Model</strong>: try gradient boosting on curated features, 1D CNN/ResNet on light curves, or hybrids. Consider sequence models for context windows.</li>
                <li><strong>Class imbalance</strong>: apply stratified sampling, focal loss, or cost-sensitive learning.</li>
                <li><strong>Explainability</strong>: SHAP/IG feature attributions, saliency on phase-folded light curves.</li>
                <li><strong>Robustness</strong>: test against blended sources using <em>Gaia neighbors</em> (sep, Gmag, BP−RP) and simulate contamination scenarios.</li>
              </ol>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6">
              <h2 className="text-xl md:text-2xl font-semibold">Evaluation</h2>
              <p className="mt-3 text-slate-200/90">
                Report metrics on a held-out set and, if possible, time-based or mission-based splits to check generalization:
              </p>
              <ul className="mt-3 list-disc pl-6 space-y-2 text-slate-200/90">
                <li>Precision/Recall, F1, ROC–AUC/PR–AUC</li>
                <li>Confusion matrix per class (planet, EB, false positive)</li>
                <li>Calibration (reliability curves) for probabilistic outputs</li>
                <li>Ablations: without Gaia neighbors; without astrophysical priors; without augmentation</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6">
              <h2 className="text-xl md:text-2xl font-semibold">Deliverables</h2>
              <ul className="mt-3 list-disc pl-6 space-y-2 text-slate-200/90">
                <li>Short paper/README describing data, pipeline, and design choices</li>
                <li>Trained model weights and inference script/notebook</li>
                <li>Reproducible environment (requirements/environment.yaml)</li>
                <li>Demo on <code>/detector</code> or CLI that scores new targets</li>
              </ul>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-semibold">Gaia Neighbors (context)</h3>
              <p className="mt-2 text-sm text-slate-200/90">
                Nearby sources can dilute or mimic transit signals. Use Gaia DR3 to retrieve neighbors within a chosen radius and include their:
              </p>
              <ul className="mt-3 list-disc pl-6 text-sm space-y-1 text-slate-200/90">
                <li><strong>sep [″]</strong> — angular separation in arcseconds</li>
                <li><strong>Gmag</strong> — broad-band G magnitude (brightness)</li>
                <li><strong>BP−RP</strong> — color index (spectral information)</li>
              </ul>
              <p className="mt-3 text-xs text-slate-400">These help flag blends and prioritize high-confidence candidates.</p>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6">
              <h3 className="text-lg font-semibold text-emerald-300">Success criteria</h3>
              <ul className="mt-2 list-disc pl-6 text-sm space-y-1 text-emerald-50/90">
                <li>High recall at low false-positive rates</li>
                <li>Clear, reproducible pipeline</li>
                <li>Insightful error analysis & interpretability</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
