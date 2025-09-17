# web/main.py
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Dict, Any
import uvicorn

app = FastAPI(title="OramaX Exoplanet API")

# CORS (if you ever call backend directly from browser — with rewrites you won't need it)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://www.oramax.space",
        "https://oramax.space",
        "http://localhost:3000",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/exoplanet/health")
def health():
    return {"ok": True}

# Prefix for app APIs expected by the frontend rewrites
API_PREFIX = "/exoplanet"

@app.get(f"{API_PREFIX}/suggest")
def suggest(q: str, domain: str = "TESS"):
    # TODO: replace with real catalog search (MAST/astroquery/etc)
    qn = q.strip()
    items = []
    if qn:
        if any(c.isdigit() for c in qn):
            base = ''.join(ch for ch in qn if ch.isdigit())[:9] or "268125229"
            items = [
                {"id": f"TIC {base}", "label": f"TIC {base}"},
                {"id": f"TIC {base}1", "label": f"TIC {base}1"},
                {"id": f"TIC {base}2", "label": f"TIC {base}2"},
            ]
        else:
            items = [{"id": f"{qn.title()}-1", "label": f"{qn.title()}-1"}]
    return {"items": items, "domain": domain}

@app.post(f"{API_PREFIX}/fetch_detect")
async def fetch_detect(payload: Dict[str, Any]):
    # TODO: call your actual pipeline and return its JSON result
    target = payload.get("target", "TIC 268125229")
    return {
        "target": target,
        "candidates": [
            {"period": 2.743, "duration": 0.08, "depth": 0.0031, "power": 18.4, "probability": 0.87}
        ],
        "preprocess": payload.get("preprocess", {}),
    }

@app.post(f"{API_PREFIX}/predict")
async def predict(body: Dict[str, Any]):
    # Body: { lightcurve: number[] }
    lc = body.get("lightcurve")
    if not isinstance(lc, list) or not lc:
        raise HTTPException(status_code=400, detail="lightcurve array required")
    # TODO: call the classifier; here we just compute a toy probability
    n = len(lc)
    prob = min(0.999, 0.5 + min(0.4, (sum(1 for v in lc if isinstance(v, (int,float)) and v>0) / max(1,n))*0.4))
    return {"planet_prob": prob, "n": n}

@app.post(f"{API_PREFIX}/predict-file")
async def predict_file(file: UploadFile = File(...)):
    # TODO: parse file and call your classifier
    content = await file.read()
    n = len(content)
    return {"planet_prob": 0.66, "size": n, "filename": file.filename}

if __name__ == "__main__":
    uvicorn.run("web.main:app", host="0.0.0.0", port=8080, reload=False)
