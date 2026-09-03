import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { validateCertificate } from "../lib/certificatesApi";
import "./EmissorCertificados.css";

export function ValidarCertificadoPublico() {
  const { code } = useParams();
  const [state, setState] = useState({ loading: true, valid: false, certificate: null, error: "" });

  useEffect(() => {
    let active = true;
    validateCertificate(code)
      .then((data) => active && setState({ loading: false, valid: Boolean(data.valid && data.certificate?.status === "valid"), certificate: data.certificate || null, error: data.error || "" }))
      .catch((e) => active && setState({ loading: false, valid: false, certificate: null, error: e.message }));
    return () => { active = false; };
  }, [code]);

  if (state.loading) return <main className="cert-main"><section className="panel"><h1>Validando certificado…</h1><p>Consultando a Central ENAT HSI.</p></section></main>;

  const c = state.certificate;
  return <main className="cert-main">
    <section className="panel" style={{maxWidth:760,margin:"40px auto"}}>
      <span className="eyebrow">CENTRAL ENAT HSI</span>
      <h1>Validação de Certificado</h1>
      <div className="notice" style={{marginTop:20}}>{state.valid ? "✓ CERTIFICADO VÁLIDO" : "✕ CERTIFICADO NÃO VÁLIDO"}</div>
      {c ? <div style={{marginTop:24,lineHeight:1.8}}>
        <p><b>Número:</b> {c.code}</p>
        <p><b>Aluno:</b> {c.student_name}</p>
        <p><b>Curso:</b> {c.course_name}</p>
        <p><b>Natureza:</b> {c.course_nature}</p>
        <p><b>Carga horária:</b> {c.hours} horas</p>
        <p><b>Modalidade:</b> {c.modality || "Não informada"}</p>
        <p><b>Conclusão:</b> {new Date(c.completion_date + "T12:00:00").toLocaleDateString("pt-BR")}</p>
        <p><b>Instituição:</b> {c.institution_name || "ENAT — Ensino Neuroeducacional Aplicado ao Trânsito"}</p>
        {c.institution_cnpj && <p><b>CNPJ:</b> {c.institution_cnpj}</p>}
        <p><b>Responsável:</b> {c.responsible}</p>
        {c.responsible_role && <p><b>Função:</b> {c.responsible_role}</p>}
        {Array.isArray(c.subjects) && c.subjects.length > 0 && <div style={{marginTop:18}}><b>Conteúdo programático:</b><ul>{c.subjects.map((s,i)=><li key={i}>{s.name} — {s.hours}h</li>)}</ul></div>}
        <p><b>Status:</b> {c.status === "valid" ? "Válido" : "Cancelado"}</p>
      </div> : <p style={{marginTop:20}}>{state.error || "O certificado não foi encontrado na base oficial da Central ENAT HSI."}</p>}
      <p style={{marginTop:28,fontSize:13,opacity:.75}}>Esta consulta é realizada diretamente na base centralizada de validação do sistema de certificados ENAT.</p>
    </section>
  </main>;
}
