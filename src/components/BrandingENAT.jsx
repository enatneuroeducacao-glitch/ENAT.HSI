import { useEffect, useState } from "react";
import "./BrandingENAT.css";

const DB_NAME = "enat-certificate-brand";
const STORE_NAME = "assets";
const KEY = "logos";
const LEGACY_ORIGIN = "https://enat-hsi-1mf2.vercel.app";

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

function writeIndexedBrand(brand) {
  return new Promise((resolve) => {
    if (!window.indexedDB) return resolve();
    let request;
    try { request = indexedDB.open(DB_NAME, 1); }
    catch { return resolve(); }
    request.onupgradeneeded = () => {
      try {
        if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME);
      } catch {}
    };
    request.onsuccess = () => {
      try {
        const db = request.result;
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put(brand, KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch { resolve(); }
    };
    request.onerror = () => resolve();
  });
}

function requestLegacyBrand() {
  return new Promise((resolve) => {
    if (window.location.origin === LEGACY_ORIGIN) return resolve({});
    let iframe;
    let timer;
    const cleanup = () => {
      window.removeEventListener("message", onMessage);
      if (timer) clearTimeout(timer);
      if (iframe) iframe.remove();
    };
    const onMessage = (event) => {
      if (event.origin !== LEGACY_ORIGIN) return;
      if (event.data?.type !== "ENAT_BRAND_RESPONSE") return;
      cleanup();
      resolve(event.data.brand || {});
    };
    window.addEventListener("message", onMessage);
    iframe = document.createElement("iframe");
    iframe.src = `${LEGACY_ORIGIN}/login`;
    iframe.title = "ENAT branding migration";
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.cssText = "position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;border:0;left:-10px;top:-10px";
    iframe.onload = () => iframe.contentWindow?.postMessage({ type: "ENAT_BRAND_REQUEST" }, LEGACY_ORIGIN);
    document.body.appendChild(iframe);
    timer = setTimeout(() => { cleanup(); resolve({}); }, 7000);
  });
}

if (typeof window !== "undefined") {
  window.addEventListener("message", async (event) => {
    if (event.origin !== "https://www.hsi-doth-pg.com.br" && event.origin !== "https://hsi-doth-pg.com.br") return;
    if (event.data?.type !== "ENAT_BRAND_REQUEST") return;
    const indexed = await readIndexedBrand();
    const local = readLegacy();
    event.source?.postMessage({
      type: "ENAT_BRAND_RESPONSE",
      brand: {
        enatLogo: indexed.enatLogo || local.enatLogo || "",
        neuroLogo: indexed.neuroLogo || local.neuroLogo || "",
      },
    }, event.origin);
  });
}

export function useENATBranding() {
  const [brand, setBrand] = useState({ enatLogo: "", neuroLogo: "" });

  useEffect(() => {
    let alive = true;
    (async () => {
      const legacy = readLegacy();
      const stored = await readIndexedBrand();
      let resolved = {
        enatLogo: stored.enatLogo || legacy.enatLogo || "",
        neuroLogo: stored.neuroLogo || legacy.neuroLogo || "",
      };

      if (!resolved.enatLogo || !resolved.neuroLogo) {
        const migrated = await requestLegacyBrand();
        resolved = {
          enatLogo: resolved.enatLogo || migrated.enatLogo || "",
          neuroLogo: resolved.neuroLogo || migrated.neuroLogo || "",
        };
        if (resolved.enatLogo || resolved.neuroLogo) await writeIndexedBrand(resolved);
      }

      if (!alive) return;
      setBrand(resolved);
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
