// ...μέσα στο component σου:

function parseNumbers(input: string): number[] {
  return input
    .trim()
    .split(/[,\s]+/)    // Κόμμα ή/και κενά
    .map((s) => Number(s))
    .filter((n) => Number.isFinite(n));
}

async function predictJson() {
  setLoading(true); setErr(null); setProb(null);
  try {
    const values = parseNumbers(raw);
    const res = await fetch('https://app.oramax.space/predict', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ lightcurve: values }),
    });
    if (!res.ok) {
      const text = await res.text();
      // προσπάθησε να βγάλεις χρήσιμο μήνυμα από JSON detail
      try { setErr(JSON.parse(text)?.detail ?? `HTTP ${res.status}`); }
      catch { setErr(`HTTP ${res.status}`); }
      return;
    }
    const data = await res.json();
    setProb(data.planet_prob ?? null);
  } catch (e:any) {
    setErr(e?.message ?? 'Request failed');
  } finally { setLoading(false); }
}

async function predictFile() {
  if (!file) return;
  setLoading(true); setErr(null); setProb(null);
  try {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('https://app.oramax.space/predict-file', {
      method: 'POST',
      body: fd,
    });
    if (!res.ok) {
      const text = await res.text();
      try { setErr(JSON.parse(text)?.detail ?? `HTTP ${res.status}`); }
      catch { setErr(`HTTP ${res.status}`); }
      return;
    }
    const data = await res.json();
    setProb(data.planet_prob ?? null);
  } catch (e:any) {
    setErr(e?.message ?? 'Request failed');
  } finally { setLoading(false); }
}
