// app/our-project/our-resources/page.tsx
import BgHero from "@/components/BgHero";

export const metadata = { title: "Our Resources — Orama X" };

export default function ResourcesPage() {
  return (
    <main className="min-h-[80vh] px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-12">
        <BgHero image="/images/resources.jpg" title="Our" subtitle="Resources">
          <p className="max-w-3xl mx-auto">
            APIs, datasets, reports, and tooling to reproduce results and integrate Orama X in your workflow.
          </p>
        </BgHero>

        {/* Overview */}
        <section className="space-y-3">
          <h2 className="text-2xl md:text-3xl font-semibold">Overview</h2>
          <p className="text-slate-300 leading-relaxed">
            Orama X exposes a small, well-documented surface area: a <b>public detector UI</b>
            for interactive vetting, a <b>REST API</b> for automation, <b>exportable artifacts</b>
            (CSV/PDF), and links to <b>open datasets</b> used in training and benchmarking.
          </p>
        </section>

        {/* Resource grid */}
        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Detector UI */}
          <div className="rounded-xl p-5 bg-white/5">
            <h3 className="font-semibold mb-2">Interactive Detector</h3>
            <p className="text-slate-300 leading-relaxed">
              Explore light curves, run BLS/CNN, view phase-folded diagnostics,
              and export results.
            </p>
            <ul className="list-disc pl-6 mt-3 text-slate-300 space-y-1">
              <li><a className="underline" href="/detector">Open Detector</a></li>
              <li>One-click <b>CSV</b> and <b>PDF</b> report exports</li>
              <li>Gaia neighbors & centroid checks inline</li>
            </ul>
          </div>

          {/* API */}
          <div className="rounded-xl p-5 bg-white/5">
            <h3 className="font-semibold mb-2">REST API</h3>
            <p className="text-slate-300">
              Scriptable access to the same pipeline the UI uses.
            </p>
            <ul className="list-disc pl-6 mt-3 text-slate-300 space-y-1">
              <li>
                Base: <code className="px-1.5 py-0.5 rounded bg-black/30">/detector/api</code>
              </li>
              <li>
                OpenAPI:{" "}
                <code className="px-1.5 py-0.5 rounded bg-black/30">/detector/api/openapi.json</code>
              </li>
              <li>
                Gaia neighbors:{" "}
                <code className="px-1.5 py-0.5 rounded bg-black/30">GET /gaia_neighbors?target=TIC…&amp;radius=60</code>
              </li>
              <li>
                Detect &amp; rank:{" "}
                <code className="px-1.5 py-0.5 rounded bg-black/30">POST /fetch_detect</code>
              </li>
            </ul>
            <div className="mt-3 text-xs text-slate-400">
              Tip: run headless scans, then download CSV/PDF artifacts.
            </div>
          </div>

          {/* Downloads / Artifacts */}
          <div className="rounded-xl p-5 bg-white/5">
            <h3 className="font-semibold mb-2">Downloads & Artifacts</h3>
            <ul className="list-disc pl-6 text-slate-300 space-y-1">
              <li>Candidate table as <b>CSV</b> (period, depth, SNR, ΔBIC, odd/even, secondary, centroid)</li>
              <li>Printable <b>PDF</b> vetting report with plots & settings</li>
              <li>Run metadata (model version, thresholds, seeds) for reproducibility</li>
            </ul>
          </div>

          {/* Datasets */}
          <div className="rounded-xl p-5 bg-white/5">
            <h3 className="font-semibold mb-2">Open Datasets</h3>
            <ul className="list-disc pl-6 text-slate-300 space-y-1">
              <li><b>TESS</b> sectors (light curves & cutouts)</li>
              <li><b>Kepler/K2</b> benchmark light curves</li>
              <li><b>Gaia DR3</b> for neighbors, photometry, astrometry</li>
            </ul>
            <p className="text-slate-400 text-sm mt-2">
              We document preprocessing choices and splits in the project notes.
            </p>
          </div>

          {/* Docs & Guides */}
          <div className="rounded-xl p-5 bg-white/5">
            <h3 className="font-semibold mb-2">Docs & Guides</h3>
            <ul className="list-disc pl-6 text-slate-300 space-y-1">
              <li>Pipeline overview & parameter reference</li>
              <li>How centroid vetting and neighbor screening work</li>
              <li>Export formats & report structure</li>
            </ul>
          </div>

          {/* Notebooks / Examples */}
          <div className="rounded-xl p-5 bg-white/5">
            <h3 className="font-semibold mb-2">Notebooks & Examples</h3>
            <ul className="list-disc pl-6 text-slate-300 space-y-1">
              <li>Batch sector scan via API</li>
              <li>Post-processing candidates (thresholds, ΔBIC filters)</li>
              <li>Scheduling follow-up using CSV exports</li>
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-xl p-6 bg-white/5">
          <h3 className="text-xl font-semibold mb-2">Collaborate with Us</h3>
          <p className="text-slate-300 leading-relaxed">
            Building for openness and repeatability is a team effort. If you need a custom export,
            an additional endpoint, or guidance on large-scale scans, reach out—we’ll help you ship.
          </p>
          <div className="mt-4">
            <a className="underline" href="/contact-us">Contact the team →</a>
          </div>
        </section>
      </div>
    </main>
  );
}
