import Link from "next/link";

export default function Home() {
  return (
    <section className="hero">
      <div>
        <h1 style={{fontSize:"44px", lineHeight:1.15, margin:"6px 0 14px 0", fontWeight:900}}>
          Orama X<br/><span style={{color:"var(--brand)"}}>Exoplanet Detector</span>
        </h1>
        <p style={{color:"var(--muted)", marginBottom:18}}>
          Live vetting of TESS light curves with AI-calibrated planet probability,
          centroid & Gaia checks, transit fits and downloadable vetting reports.
        </p>
        <div style={{display:"flex", gap:10}}>
          <Link className="btn" href="/detector">Open Detector</Link>
          <Link className="btn" href="/contact">Contact</Link>
        </div>
      </div>
      <div className="card">
        <b>Highlights</b>
        <ul style={{marginTop:10, color:"#cfe4ff"}}>
          <li>BLS search & calibrated P(planet)</li>
          <li>Centroid vetting + Gaia neighbors</li>
          <li>Transit modeling (batman/trapezoid)</li>
          <li>Ephemeris cross-match (TOIs)</li>
          <li>PDF Vetting Report & CSV export</li>
        </ul>
      </div>
    </section>
  );
}
