// app/our-project/page.tsx
import BgHero from "@/components/BgHero";

export const metadata = {
  title: "Our Project — Orama X",
  description: "Exoplanet Detector: Project overview",
};

export default function ProjectPage() {
  return (
    <main className="min-h-[80vh] px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-10">
        <BgHero
          image="/images/project.jpg"   // φόντο από public/images
          title="Project"
          subtitle="Exoplanet"
        >
          <p className="max-w-3xl mx-auto text-base md:text-lg leading-7">
            We build a reliable, fast, and transparent pipeline for finding
            exoplanets in TESS/Kepler light curves—combining classical BLS with
            vetted ML, robust detrending, centroid vetting, and Gaia neighbors.
          </p>
        </BgHero>

        {/* προαιρετικό περιεχόμενο κάτω από το hero */}
        <section className="prose prose-invert max-w-3xl mx-auto">
          <h2>What we’re building</h2>
          <p>
            A cohesive system that fetches data, denoises, detects, and
            generates reproducible reports for scientific review.
          </p>
        </section>
      </div>
    </main>
  );
}
