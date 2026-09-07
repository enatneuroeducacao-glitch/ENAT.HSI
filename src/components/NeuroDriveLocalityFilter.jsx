import React, { useMemo, useState } from "react";

export default function NeuroDriveLocalityFilter({ locality = [], onChange }) {
  const [uf, setUf] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [municipalityQuery, setMunicipalityQuery] = useState("");
  const ufs = useMemo(() => locality.map((x) => x.uf).filter(Boolean).sort(), [locality]);
  const municipalities = useMemo(() => { const state = locality.find((x) => x.uf === uf); return (state?.municipalities || []).map((x) => x.name).filter(Boolean).sort((a, b) => a.localeCompare(b, "pt-BR")); }, [locality, uf]);
  const filteredMunicipalities = useMemo(() => { const q = municipalityQuery.trim().toLocaleLowerCase("pt-BR"); return q ? municipalities.filter((name) => name.toLocaleLowerCase("pt-BR").includes(q)) : municipalities; }, [municipalities, municipalityQuery]);
  const emit = (nextUf, nextMunicipality) => onChange?.({ uf: nextUf, municipality: nextMunicipality });
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, alignItems: "end" }}>
    <label style={{ display: "grid", gap: 6 }}><span style={labelStyle}>ESTADO (UF)</span><select value={uf} onChange={(e) => { const value = e.target.value; setUf(value); setMunicipality(""); setMunicipalityQuery(""); emit(value, ""); }} style={inputStyle}><option value="">Todos os estados</option>{ufs.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
    <label style={{ display: "grid", gap: 6 }}><span style={labelStyle}>BUSCAR MUNICÍPIO</span><input value={municipalityQuery} disabled={!uf} onChange={(e) => setMunicipalityQuery(e.target.value)} placeholder={uf ? "Digite parte do município…" : "Selecione uma UF primeiro"} style={{ ...inputStyle, opacity: uf ? 1 : .55 }} /></label>
    <label style={{ display: "grid", gap: 6 }}><span style={labelStyle}>MUNICÍPIO</span><select value={municipality} disabled={!uf} onChange={(e) => { const value = e.target.value; setMunicipality(value); emit(uf, value); }} style={{ ...inputStyle, opacity: uf ? 1 : .55 }}><option value="">Todos os municípios</option>{filteredMunicipalities.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
    <button type="button" onClick={() => { setUf(""); setMunicipality(""); setMunicipalityQuery(""); emit("", ""); }} style={{ ...inputStyle, cursor: "pointer", textAlign: "center" }}>Limpar filtros</button>
  </div>;
}
const labelStyle = { color: "#8fa8ba", fontSize: 12, letterSpacing: ".08em" };
const inputStyle = { width: "100%", boxSizing: "border-box", minHeight: 42, padding: "9px 11px", borderRadius: 9, border: "1px solid rgba(99,202,255,.2)", background: "#091824", color: "#eaf6ff", outline: "none" };
