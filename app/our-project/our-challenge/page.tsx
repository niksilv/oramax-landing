// app/our-project/our-challenge/page.tsx
import BgHero from "@/components/BgHero";

export const metadata = { title: "Our Challenge — Orama X" };

export default function ChallengePage() {
  return (
    <main className="min-h-[80vh] px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-12">
        <BgHero image="/images/challenge.jpg" title="Our" subtitle="Challenge">
          <p className="max-w-3xl mx-auto">
            Why exoplanet discovery is hard—and how Orama X raises trust,
            speed, and reproducibility for the NASA ecosystem.
          </p>
        </BgHero>

        {/* Problem framing */}
        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-semibold">The Problem We’re Tackling</h2>
          <p className="text-slate-300 leading-relaxed">
            Space-based surveys like <b>TESS</b> and <b>Kepler</b> produce millions of light curves. 
            Turning those into <b>reliable</b> exoplanet candidates is challenging: stellar variability,
            systematics, blended sources, and data gaps all conspire to create false positives. 
            Traditional vetting is <b>slow</b>, often <b>manual</b>, and difficult to <b>reproduce</b> end-to-end.
          </p>
          <ul className="list-disc pl-6 space-y-1 text-slate-300">
            <li><b>Scale:</b> millions of targets, multiple observing sectors, evolving calibrations.</li>
            <li><b>Ambiguity:</b> eclipsing binaries and instrumental artifacts mimic transit signals.</li>
            <li><b>Blends:</b> crowded fields make centroid motion and neighbor contamination critical.</li>
            <li><b>Traceability:</b> ad-hoc settings hinder auditability and collaboration.</li>
          </ul>
        </section>

        {/* Our approach */}
        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-semibold">Our Approach</h2>
          <p className="text-slate-300 leading-relaxed">
            Orama X unifies <b>classic signal processing</b> with <b>modern ML</b> and 
            contextual information from <b>Gaia</b>. We automate the heavy lifting while 
            keeping every decision <b>transparent</b> and <b>auditable</b>.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl p-5">
              <h3 className="font-semibold mb-2">Technical Pillars</h3>
              <ul className="list-disc pl-6 space-y-1 text-slate-300">
                <li><b>Preprocessing:</b> quality masks, outlier rejection, configurable detrending.</li>
                <li><b>Detection:</b> <b>BLS</b> for periodicity plus a lightweight <b>CNN</b> for ranking.</li>
                <li><b>Context:</b> <b>Gaia neighbors</b>, centroid consistency, and dilution checks.</li>
                <li><b>Diagnostics:</b> phase-folded views, odd/even, secondary search, ΔBIC, SNR.</li>
              </ul>
            </div>
            <div className="rounded-xl p-5">
              <h3 className="font-semibold mb-2">Trust & Reproducibility</h3>
              <ul className="list-disc pl-6 space-y-1 text-slate-300">
                <li><b>Deterministic runs:</b> fixed seeds and explicit parameter capture.</li>
                <li><b>Full provenance:</b> inputs, settings, and model versions saved with results.</li>
                <li><b>One-click reports:</b> printable PDFs and CSV exports for follow-up teams.</li>
                <li><b>Human-in-the-loop:</b> interactive vetting for rapid collaborative review.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* What success looks like */}
        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-semibold">What Success Looks Like</h2>
          <p className="text-slate-300 leading-relaxed">
            We measure impact across three axes—<b>precision</b>, <b>velocity</b>, and <b>clarity</b>:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-slate-300">
            <li><b>Higher precision</b> on vetted candidates via centroid and neighbor screening.</li>
            <li><b>Faster triage</b> of sector-scale datasets with reproducible pipelines.</li>
            <li><b>Clearer hand-offs</b> to observers through standardized, audit-ready reports.</li>
          </ul>
        </section>

        {/* Roadmap */}
        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-semibold">Roadmap</h2>
          <ol className="list-decimal pl-6 space-y-1 text-slate-300">
            <li><b>Model hardening:</b> balanced training sets, calibration drifts, uncertainty estimates.</li>
            <li><b>Broader coverage:</b> cadence-aware handling of additional missions and sectors.</li>
            <li><b>Follow-up hooks:</b> export formats for RV/photometric scheduling pipelines.</li>
            <li><b>Open benchmarks:</b> side-by-side comparisons on public vetting sets.</li>
          </ol>
        </section>

        {/* CTA */}
        <section className="rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-2">Partner with Us</h3>
          <p className="text-slate-300 leading-relaxed">
            We welcome collaborations with survey teams and follow-up networks.
            Let’s validate at scale, publish reproducible results, and accelerate the discovery of new worlds.
          </p>
        </section>
      </div>
    </main>
  );
}
