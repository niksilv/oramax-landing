"use client";
import Script from "next/script";
const html17b = String.raw$html17b;
export default function Detector17B(){ return (<>
  <Script src="https://cdn.plot.ly/plotly-2.26.0.min.js" strategy="afterInteractive" />
  <div dangerouslySetInnerHTML={{ __html: html17b }} />
  <Script src="/predictor-17b.js" strategy="afterInteractive" />
</>); }