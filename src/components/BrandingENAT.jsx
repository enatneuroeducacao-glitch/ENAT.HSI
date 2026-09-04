import { useEffect, useState } from "react";
import "./BrandingENAT.css";

const DB_NAME = "enat-certificate-brand";
const STORE_NAME = "assets";
const KEY = "logos";

function readLegacy() {
  try { return JSON.parse(localStorage.getItem("enat_certificate_brand_v2") || "{}"); }
  catch { return {}; }
}

function readIndexedBrand() {
  return new Promise((resolve) => {
    if (!window.indexedDB) return resolve({});
    let request;
    try { request = indexedDB.open(DB_NAME, 1); }
    catch { return resolve({}); }
    request.onupgradeneeded = () => {
      try {
        if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME);
      } catch {}
    };
    request.onsuccess = () => {
      try {
        const db = request.result;
        const q = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(KEY);
        q.onsuccess = () => resolve(q.result || {});
        q.onerror = () => resolve({});
      } catch { resolve({}); }
    };
    request.onerror = () => resolve({});
  });
}

export function useENATBranding() {
  const [brand, setBrand] = useState({ enatLogo: "", neuroLogo: "" });

  useEffect(() => {
    let alive = true;
    (async () => {
      const legacy = readLegacy();
      const stored = await readIndexedBrand();
      if (!alive) return;
      setBrand({
        enatLogo: stored.enatLogo || legacy.enatLogo || "",
        neuroLogo: stored.neuroLogo || legacy.neuroLogo || "",
      });
    })();
    return () => { alive = false; };
  }, []);

  return brand;
}

export function BrandingENAT({ variant = "header", className = "" }) {
  const { enatLogo, neuroLogo } = useENATBranding();
  const hasLogos = enatLogo || neuroLogo;

  return (
    <div className={`branding-enat branding-${variant} ${className}`} aria-label="Identidade ENAT e Neurociência Aplicada ao Trânsito">
      {neuroLogo ? <img src={neuroLogo} alt="Neurociência Aplicada ao Trânsito" className="branding-neuro" /> : null}
      {enatLogo ? <img src={enatLogo} alt="ENAT — Ensino Neuroeducacional Aplicado ao Trânsito" className="branding-enat-logo" /> : null}
      {!hasLogos ? <div className="branding-fallback"><strong>ENAT</strong><span>HSI</span></div> : null}
    </div>
  );
}
