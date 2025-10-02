// app/our-project/our-resources/page.tsx

export const metadata = { title: "Our Resources — Orama X" };

export default function ResourcesPage() {
  return (
    <main
      className="relative min-h-screen bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/images/resources.jpg')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 space-y-12">
        {/* Hero */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold">Our Resources</h1>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-slate-200">
            APIs, datasets, reports, and tooling to reproduce results and integrate Orama X in your workflow.
          </p>
        </div>

        {/* Overview */}
        <section className="space-y-3">
          <h2 className="text-2xl md:text-3xl font-semibold">Overview</h2>
          <p className="text-slate-200 leading-relaxed">
            Orama X exposes a small, well-documented surface area: a <b>public detector UI</b>
            for interactive vetting, a <b>REST API</b> for automation, <b>exportable artifacts</b>
            (CSV/PDF), and links to <b>open datasets</b> used in training and benchmarking.
          </p>
        </section>

        {/* Resource grid */}
        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="rounded-xl p-5 bg-black/50">
            <h3 className="font-semibold mb-2">Interactive Detector</h3>
            <p className="leading-relaxed text-slate-200">
              Explore light curves, run BLS/CNN, view phase-folded diagnostics, and export results.
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-1 text-slate-200">
              <li><a className="underline" href="/detector">Open Detector</a></li>
              <li>One-click <b>CSV</b> and <b>PDF</b> report exports</li>
              <li>Gaia neighbors & centroid checks inline</li>
            </ul>
          </div>

          <div className="rounded-xl p-5 bg-black/50">
            <h3 className="font-semibold mb-2">REST API</h3>
            <p className="text-slate-200">Scriptable access to the same pipeline the UI uses.</p>
            <ul className="list-disc pl-6 mt-3 space-y-1 text-slate-200">
              <li>Base: <code className="bg-black/40 px-1.5 py-0.5 rounded">/detector/api</code></li>
              <li>OpenAPI: <code className="bg-black/40 px-1.5 py-0.5 rounded">/detector/api/openapi.json</code></li>
              <li>Gaia neighbors: <code className="bg-black/40 px-1.5 py-0.5 rounded">GET /gaia_neighbors</code></li>
              <li>Detect &amp; rank: <code className="bg-black/40 px-1.5 py-0.5 rounded">POST /fetch_detect</code></li>
            </ul>
          </div>

          <div className="rounded-xl p-5 bg-black/50">
            <h3 className="font-semibold mb-2">Downloads & Artifacts</h3>
            <ul className="list-disc pl-6 space-y-1 text-slate-200">
              <li>Candidate table as CSV (period, depth, SNR, ΔBIC, odd/even, secondary, centroid)</li>
              <li>Printable PDF vetting report with plots & settings</li>
              <li>Run metadata for reproducibility</li>
            </ul>
          </div>

          <div className="rounded-xl p-5 bg-black/50">
            <h3 className="font-semibold mb-2">Open Datasets</h3>
            <ul className="list-disc pl-6 space-y-1 text-slate-200">
              <li><b>TESS</b> sectors (light curves & cutouts)</li>
              <li><b>Kepler/K2</b> benchmark light curves</li>
              <li><b>Gaia DR3</b> neighbors, photometry, astrometry</li>
            </ul>
          </div>

          <div className="rounded-xl p-5 bg-black/50">
            <h3 className="font-semibold mb-2">Docs & Guides</h3>
            <ul className="list-disc pl-6 space-y-1 text-slate-200">
              <li>Pipeline overview & parameter reference</li>
              <li>Centroid vetting & neighbor screening</li>
              <li>Export formats & report structure</li>
            </ul>
          </div>

          <div className="rounded-xl p-5 bg-black/50">
            <h3 className="font-semibold mb-2">Notebooks & Examples</h3>
            <ul className="list-disc pl-6 space-y-1 text-slate-200">
              <li>Batch sector scan via API</li>
              <li>Post-processing candidates (thresholds, ΔBIC filters)</li>
              <li>Scheduling follow-up using CSV exports</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
