// app/our-project/our-challenge/page.tsx
export const metadata = {
  title: "Our Challenge — Orama X",
  description:
    "Build an AI/ML model using open NASA exoplanet datasets to accurately identify exoplanets from new data.",
};

export default function OurChallengePage() {
  return (
    <main
      className="relative min-h-screen bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/images/challenge.jpg')" }}
    >
      {/* Overlay για καλύτερη αναγνωσιμότητα */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Περιεχόμενο */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 space-y-16">
        {/* Hero section */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold">Our Challenge</h1>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-slate-200">
            Data from several different space-based exoplanet surveying missions have enabled discovery of thousands of new planets outside our solar system, but most of these exoplanets were identified manually. With advances in artificial intelligence and machine learning (AI/ML), it is possible to automatically analyze large sets of data collected by these missions to identify exoplanets. Your challenge is to create an AI/ML model that is trained on one or more of the open-source exoplanet datasets offered by NASA and that can analyze new data to accurately identify exoplanets. <span className="whitespace-nowrap">(Astrophysics Division)</span>
          </p>
        </div>

        {/* Τρία βασικά sections (στυλ όπως στο Our Project) */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-white/10 backdrop-blur p-6">
            <h3 className="text-xl font-semibold mb-2">Goal</h3>
            <p className="text-sm text-slate-200">
              Train a robust, generalizable classifier to distinguish planets from
              eclipsing binaries and instrumental false positives.
            </p>
          </div>
          <div className="rounded-xl bg-white/10 backdrop-blur p-6">
            <h3 className="text-xl font-semibold mb-2">Datasets</h3>
            <p className="text-sm text-slate-200">
              Use open NASA datasets (e.g., TESS/Kepler/K2) and optional Gaia DR3
              context to improve confidence and reduce contamination.
            </p>
          </div>
          <div className="rounded-xl bg-white/10 backdrop-blur p-6">
            <h3 className="text-xl font-semibold mb-2">Outcomes</h3>
            <p className="text-sm text-slate-200">
              Accurate predictions, clear explainability, and reproducible
              experiments suitable for scientific review.
            </p>
          </div>
        </div>

        {/* Enriched details */}
        <div className="prose prose-invert max-w-3xl mx-auto">
          <h2>What to Build</h2>
          <ul>
            <li>
              <b>Model:</b> gradient-boosted features or 1D CNNs/transformers on
              light curves; hybrids are welcome.
            </li>
            <li>
              <b>Preprocessing:</b> masks, outlier handling, detrending, and
              phase-folding of candidate periods.
            </li>
            <li>
              <b>Generalization:</b> evaluate across missions and times to avoid
              overfitting to a single distribution.
            </li>
            <li>
              <b>Explainability:</b> SHAP/IG or saliency maps on phase-folded
              curves; calibration checks for probabilities.
            </li>
          </ul>

          <h2>Suggested Datasets</h2>
          <ul>
            <li><b>TESS</b> light curves & full-frame derived series</li>
            <li><b>Kepler/K2</b> labeled candidates and false positives</li>
            <li><b>Gaia DR3</b> neighbors: sep [″], Gmag, BP−RP for blend checks</li>
          </ul>

          <h2>Evaluation</h2>
          <ul>
            <li>Precision/Recall, F1, ROC–AUC or PR–AUC</li>
            <li>Confusion matrix per class (planet / EB / false positive)</li>
            <li>Time- or mission-split validation for robustness</li>
          </ul>

          <h2>Deliverables</h2>
          <ul>
            <li>Short README/paper with pipeline design and assumptions</li>
            <li>Trained weights + inference script/notebook</li>
            <li>Environment file for reproducibility</li>
            <li>Optional demo on <code>/detector</code></li>
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
