"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/router";

export default function OramaxCnnLoader() {
  const loaded = useRef(false);
  const router = useRouter();

  useEffect(() => {
    const path = router?.pathname || "";
    if (!path.startsWith("/detector")) return;
    if (loaded.current) return;
    loaded.current = true;

    if (document.querySelector('script[data-ormax="cnn-toggle"]')) return;

    const s = document.createElement("script");
    s.src = "/ormax-ml-toggle.js";
    s.defer = true;
    s.setAttribute("data-ormax", "cnn-toggle");
    s.onload = () => console.log("[ORAMAX] loader injected script on /detector");
    s.onerror = () => console.warn("[ORAMAX] failed to load /ormax-ml-toggle.js");
    document.head.appendChild(s);
  }, [router?.pathname]);

  return null;
}
