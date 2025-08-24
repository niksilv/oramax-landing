"use client";

const api = (process.env.NEXT_PUBLIC_API_ORIGIN ?? "http://127.0.0.1:8000").replace(/\/$/,"");
export default function Detector(){
  const url = `${api}/exoplanet`;
  return (
    <main style={{padding:24}}>
      <h1>Exoplanet Detector</h1>
      <iframe
        title="OramaX Detector"
        src={url}
        style={{width:"100%", height:"85vh", border:"0", borderRadius:12}}
      />
    </main>
  );
}
