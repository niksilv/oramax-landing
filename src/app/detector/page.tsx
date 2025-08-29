"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Api, SuggestItem } from "@/components/ApiBridge";

type PredictResp = { planet_prob?: number; [k: string]: unknown };

function parseNumbers(input: string): number[] {
  // δέχεται: CSV, space-separated, newlines, ή JSON array
  const trimmed = (input || "").trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    const arr = JSON.parse(trimmed);
    if (!Array.isArray(arr)) throw new Error("JSON must be an array of numbers");
    return arr.map(Number).filter((n) => Number.isFinite(n));
  }
  return trimmed
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number)
    .filter((n) => Number.isFinite(n));
}

export default function DetectorPage() {
  // UI state
  const [apiOk, setApiOk] = useState<boolean | null>(null);
  const [pretty, setPretty] = useState(true);

  // Target + suggestions
  const [target, setTarget] = useState("TIC 268125229");
  const [suggest, setSuggest] = useState<SuggestItem[]>([]);
  const [showSuggest, setShowSuggest] = useState(false);

  // Lightcurve input/file
  const [lcText, setLcText] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // Results
  const [jsonOut, setJsonOut] = useState<unknown>({});
  const [prob, setProb] = useState<number | null>(null);
  const [loading, setLoading] = useState<null | "predict" | "file" | "health">(null);
  const [error, setError] = useState<string | null>(null);

  // ───────────────────── API checks
  async function checkApi() {
    setLoading("health");
    setError(null);
    try {
      const r = await Api.health();
      setApiOk(r.ok);
      setJsonOut(r.body);
    } catch (e: any) {
      setApiOk(false);
      setError(e?.message ?? "API check failed");
    } finally {
      setLoading(null);
    }
  }

  // ───────────────────── Suggestions (debounced)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  async function handleTargetChange(val: string) {
    setTarget(val);
    if (timer.current) clearTimeout(timer.current);
    if (!val || val.length < 3) {
      setSuggest([]);
      setShowSuggest(false);
      return;
    }
    timer.current = setTimeout(async () => {
      try {
        const r = await Api.suggest(val, "TESS");
        const body = r.body as { items?: SuggestItem[] } | undefined;
        const items = Array.isArray(body?.items) ? body!.items! : [];
        setSuggest(items);
        setShowSuggest(true);
      } catch {
        setSuggest([]);
        setShowSuggest(false);
      }
    }, 220);
  }

  function selectSuggestion(s: SuggestItem) {
    setTarget(s.label);
    setShowSuggest(false);
  }

  // ───────────────────── Predict (JSON text)
  async function onPredict() {
    setLoading("predict");
    setError(null);
    setProb(null);
    try {
      const arr = parseNumbers(lcText);
      if (!arr.length) throw new Error("Please provide lightcurve numbers (CSV/JSON/list).");
      const r = await Api.predict(arr);
      setJsonOut(r.body);
      const p = (r.body as PredictResp)?.planet_prob;
      if (typeof p === "number") setProb(p);
    } catch (e: any) {
      setError(e?.message ?? "Prediction failed");
    } finally {
      setLoading(null);
    }
  }

  // ───────────────────── Predict (file)
  async function onPredictFile() {
    if (!file) {
      setError("Please choose a file (.csv or .txt).");
      return;
    }
    setLoading("file");
    setError(null);
    setProb(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await Api.predictFile(fd);
      setJsonOut(r.body);
      const p = (r.body as PredictResp)?.planet_prob;
      if (typeof p === "number") setProb(p);
    } catch (e: any) {
      setError(e?.message ?? "File prediction failed");
    } finally {
      setLoading(null);
    }
  }

  // ───────────────────── Render helpers
  const rendered = useMemo(() => {
    if (typeof jsonOut === "string") return jsonOut;
    return pretty ? JSON.stringify(jsonOut, null, 2) : JSON.stringify(jsonOut);
  }, [jsonOut, pretty]);

  useEffect(() => {
    // προαιρετικό: αυτόματο health-check στην είσοδο
    checkApi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container" style={{ padding: "24px 16px", maxWidth: 960, margin: "0 auto" }}>
      <h1 className="text-3xl" style={{ fontWeight: 800, fontSize: 36, marginBottom: 16 }}>
        Exoplanet Detector
      </h1>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
          <input type="checkbox" checked={pretty} onChange={(e) => setPretty(e.target.checked)} />
          Pretty-print
        </label>
        <button onClick={checkApi} disabled={loading === "health"} className="btn">
          {loading === "health" ? "Checking…" : "Check API"}
        </button>
        <span style={{ fontSize: 14 }}>
          {apiOk == null ? "" : apiOk ? "API OK" : "API error"}
        </span>
      </div>

      {/* Target + Suggestions */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <label style={{ fontSize: 14, display: "block", marginBottom: 4 }}>Target</label>
        <input
          value={target}
          onChange={(e) => handleTargetChange(e.target.value)}
          onFocus={() => suggest.length && setShowSuggest(true)}
          onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
          className="input"
          placeholder="TIC 268125229"
          style={{ width: "100%" }}
        />
        {showSuggest && suggest.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 10,
              background: "var(--surface, #111)",
              border: "1px solid var(--border, #333)",
              borderTop: "none",
              maxHeight: 220,
              overflowY: "auto",
            }}
          >
            {suggest.map((s) => (
              <div
                key={s.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectSuggestion(s)}
                style={{ padding: "8px 10px", cursor: "pointer" }}
              >
                {s.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightcurve text */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 14, display: "block", marginBottom: 4 }}>
          Lightcurve (CSV / space-separated / JSON array)
        </label>
        <textarea
          value={lcText}
          onChange={(e) => setLcText(e.target.value)}
          className="input"
          rows={6}
          placeholder="0.999, 1.001, 0.998, 1.000, 0.997, …"
          style={{ width: "100%", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
        />
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button onClick={onPredict} disabled={loading === "predict"} className="btn">
            {loading === "predict" ? "Predicting…" : "Predict"}
          </button>
        </div>
      </div>

      {/* File upload */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 14, display: "block", marginBottom: 4 }}>Or upload file (.csv / .txt)</label>
        <input type="file" accept=".csv,.txt" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <div style={{ display: "inline-flex", gap: 8, marginLeft: 8 }}>
          <button onClick={onPredictFile} disabled={loading === "file"} className="btn">
            {loading === "file" ? "Predicting…" : "Predict (File)"}
          </button>
        </div>
      </div>

      {/* Output */}
      {error && (
        <div style={{ color: "#f87171", marginBottom: 12 }}>
          {error}
        </div>
      )}
      {prob != null && (
        <div style={{ marginBottom: 12, fontSize: 16 }}>
          <strong>Planet Probability:</strong> {Math.round(prob * 1000) / 10}%
        </div>
      )}
      <pre
        className="output"
        style={{
          padding: 12,
          border: "1px solid var(--border, #333)",
          background: "var(--surface-2, #0a0a0a)",
          borderRadius: 6,
          overflow: "auto",
          fontSize: 12,
        }}
      >
        {rendered}
      </pre>

      <style jsx global>{`
        .btn {
          padding: 6px 10px;
          border: 1px solid var(--border, #333);
          background: transparent;
          border-radius: 6px;
          font-size: 12px;
        }
        .btn:hover { background: rgba(255,255,255,0.05); }
        .input {
          padding: 8px 10px;
          border: 1px solid var(--border, #333);
          background: transparent;
          border-radius: 6px;
          color: inherit;
        }
      `}</style>
    </div>
  );
}
