import React, { useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { useNavigate, useParams } from "react-router-dom";

const KEY_COURSES = "enat_certificate_courses_v1";
const KEY_CERTS = "enat_certificates_v1";
const DEFAULT_COURSE = {
  name: "ENAT — Ensino Neuroeducacional Aplicado ao Trânsito",
  description: "Formação em neuroeducação aplicada ao trânsito.",
  modality: "Online",
  start: "",
  end: "",
  responsible: "ENAT — Ensino Neuroeducacional Aplicado ao Trânsito",
  subjects: [
    { name: "Legislação e Normas de Trânsito", hours: 20 },
    { name: "Psicologia, Neurociência e Comportamento", hours: 25 },
    { name: "Direção Defensiva e Percepção de Risco", hours: 20 },
    { name: "Infrações e Responsabilidade", hours: 15 },
    { name: "Mecânica Básica", hours: 10 },
    { name: "Primeiros Socorros", hours: 10 },
    { name: "Meio Ambiente, Ética e Cidadania", hours: 20 },
  ],
};

function load(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; } }
function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function maskCPF(v) { const d = String(v).replace(/\D/g, "").slice(0, 11); return d.length === 11 ? `***.***.***-${d.slice(-2)}` : d; }
function cpfDigits(v) { return String(v).replace(/\D/g, ""); }
function nextCode(certs) { const year = new Date().getFullYear(); const max = certs.filter(c => c.code?.startsWith(`ENAT-${year}-`)).reduce((m, c) => Math.max(m, Number(c.code.split("-").pop()) || 0), 0); return `ENAT-${year}-${String(max + 1).padStart(6, "0")}`; }
function totalHours(course) { return course.subjects.reduce((s, x) => s + (Number(x.hours) || 0), 0); }

export function EmissorCertificados() {
  const [courses, setCourses] = useState(() => load(KEY_COURSES, [DEFAULT_COURSE]));
  const [certs, setCerts] = useState(() => load(KEY_CERTS, []));
  const [course, setCourse] = useState(() => load(KEY_COURSES, [DEFAULT_COURSE])[0]);
  const [name, setName] = useState(""); const [cpf, setCpf] = useState(""); const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [message, setMessage] = useState(""); const [tab, setTab] = useState("emitir");
  const total = useMemo(() => totalHours(course), [course]);

  function addSubject() { setCourse(c => ({...c, subjects:[...c.subjects,{name:"Nova matéria",hours:0}]})); }
  function updateSubject(i, field, value) { setCourse(c => ({...c, subjects:c.subjects.map((s,idx)=>idx===i?{...s,[field]:field==="hours"?Number(value):value}:s)})); }
  function removeSubject(i) { setCourse(c => ({...c, subjects:c.subjects.filter((_,idx)=>idx!==i)})); }
  function saveCourse() { const exists = courses.some(c => c.id === course.id); const updated = exists ? courses.map(c=>c.id===course.id?course:c) : [...courses,{...course,id:crypto.randomUUID()}]; setCourses(updated); save(KEY_COURSES,updated); setMessage("Curso salvo com sucesso."); }
  function newCourse() { setCourse({name:"",description:"",modality:"Online",start:"",end:"",responsible:"ENAT",subjects:[]}); setMessage(""); }
  async function emit() {
    if (!name.trim() || cpfDigits(cpf).length !== 11 || !course.name.trim() || total <= 0) { setMessage("Informe nome, CPF válido e um curso com carga horária."); return; }
    const certificate = { code:nextCode(certs), name:name.trim(), cpf:cpfDigits(cpf), course:{...course}, hours:total, completionDate:date, status:"valid", issuedAt:new Date().toISOString() };
    const updated=[certificate,...certs]; setCerts(updated); save(KEY_CERTS,updated); await generatePDF(certificate); setMessage(`Certificado ${certificate.code} emitido e salvo.`); setName(""); setCpf("");
  }
  async function generatePDF(c) {
    const doc = new jsPDF({unit:"mm",format:"a4"}); const w=210,h=297;
    doc.setFillColor(8,38,67); doc.rect(0,0,w,18,"F"); doc.setTextColor(255,255,255); doc.setFont("helvetica","bold"); doc.setFontSize(15); doc.text("ENAT",18,11); doc.setFontSize(7); doc.text("ENSINO NEUROEDUCACIONAL APLICADO AO TRÂNSITO",42,11);
    doc.setDrawColor(20,160,220); doc.setLineWidth(1); doc.rect(8,8,w-16,h-16);
    doc.setTextColor(8,38,67); doc.setFontSize(27); doc.text("CERTIFICADO",w/2,48,{align:"center"});
    doc.setFontSize(11); doc.setFont("helvetica","normal"); doc.setTextColor(60,70,80); doc.text("Certificamos que",w/2,65,{align:"center"});
    doc.setFont("helvetica","bold"); doc.setFontSize(20); doc.setTextColor(15,35,55); doc.text(c.name,w/2,80,{align:"center"});
    doc.setFont("helvetica","normal"); doc.setFontSize(10); doc.text(`CPF: ${maskCPF(c.cpf)}`,w/2,89,{align:"center"});
    doc.setFontSize(12); doc.text("concluiu o curso",w/2,104,{align:"center"}); doc.setFont("helvetica","bold"); doc.setFontSize(15); doc.text(c.course.name,w/2,115,{align:"center",maxWidth:170});
    doc.setFont("helvetica","normal"); doc.setFontSize(10); doc.text(`Carga horária total: ${c.hours} horas`,w/2,130,{align:"center"});
    doc.setFontSize(9); doc.text(`Modalidade: ${c.course.modality || "—"}`,w/2,137,{align:"center"});
    let y=153; doc.setFont("helvetica","bold"); doc.setFontSize(11); doc.text("CONTEÚDO PROGRAMÁTICO",18,y); y+=8; doc.setFont("helvetica","normal"); doc.setFontSize(8.5);
    c.course.subjects.forEach((s,i)=>{ if(y>220){doc.addPage();y=25;} doc.text(`${i+1}. ${s.name}`,20,y); doc.text(`${s.hours}h`,180,y,{align:"right"}); y+=6; });
    y=Math.max(y+5,235); doc.setFontSize(9); doc.text(`Concluído em ${new Date(c.completionDate+"T12:00:00").toLocaleDateString("pt-BR")}`,18,y); doc.text(`Responsável: ${c.course.responsible || "ENAT"}`,18,y+7);
    doc.setFont("helvetica","bold"); doc.text(c.code,w/2,y+18,{align:"center"});
    const validation = `${window.location.origin}/validar/${c.code}`; const qr=await QRCode.toDataURL(validation,{width:180,margin:1}); doc.addImage(qr,"PNG",164,245,28,28); doc.setFont("helvetica","normal"); doc.setFontSize(6.5); doc.text("Validação digital",178,276,{align:"center"});
    doc.setFontSize(6); doc.text("Documento emitido pelo ENAT. A autenticidade pode ser conferida pelo código ou QR Code.",w/2,286,{align:"center"});
    doc.save(`${c.code}-${c.name.replace(/[^a-z0-9]+/gi,"-")}.pdf`);
  }
  async function redownload(c){ await generatePDF(c); }
  function cancel(code){ const updated=certs.map(c=>c.code===code?{...c,status:c.status==="valid"?"cancelled":"valid"}:c); setCerts(updated); save(KEY_CERTS,updated); }

  return <div className="cert-shell"><header className="cert-header"><div><strong>ENAT</strong><span> Emissor de Certificados</span></div><div className="hsi-badge">ENAT • HSI</div></header>
    <main className="cert-main"><div className="cert-title"><div><span className="eyebrow">CENTRAL ENAT HSI</span><h1>Emissor de Certificados</h1><p>Configure seus cursos e emita certificados verificáveis.</p></div><div className="stats"><b>{certs.length}</b><span>certificados</span></div></div>
    <nav className="cert-tabs"><button className={tab==="emitir"?"active":""} onClick={()=>setTab("emitir")}>Emitir</button><button className={tab==="curso"?"active":""} onClick={()=>setTab("curso")}>Configurar curso</button><button className={tab==="historico"?"active":""} onClick={()=>setTab("historico")}>Certificados</button></nav>
    {message && <div className="notice">{message}</div>}
    {tab==="emitir" && <section className="grid2"><div className="panel"><h2>Dados do aluno</h2><label>Nome completo<input value={name} onChange={e=>setName(e.target.value)} placeholder="Nome do aluno" /></label><label>CPF<input value={cpf} onChange={e=>setCpf(e.target.value)} placeholder="000.000.000-00" inputMode="numeric" /></label><label>Data de conclusão<input type="date" value={date} onChange={e=>setDate(e.target.value)} /></label><label>Curso<select value={course.id||"default"} onChange={e=>setCourse(courses.find(x=>x.id===e.target.value)||courses[0])}>{courses.map((c,i)=><option key={c.id||i} value={c.id||"default"}>{c.name}</option>)}</select></label><button className="primary" onClick={emit}>Gerar certificado PDF</button></div><div className="panel preview"><span className="mini">PRÉVIA</span><h2>Certificado ENAT</h2><div className="preview-name">{name || "Nome do aluno"}</div><p>CPF: {cpf ? maskCPF(cpf) : "***.***.***-00"}</p><h3>{course.name || "Curso"}</h3><strong>{total} horas</strong><p>{course.modality} • Código gerado automaticamente</p></div></section>}
    {tab==="curso" && <section className="panel"><div className="section-head"><div><h2>Configuração do curso</h2><p>A carga horária é calculada automaticamente pelas matérias.</p></div><div className="hours">{total} <small>horas</small></div></div><div className="formgrid"><label>Nome do curso<input value={course.name} onChange={e=>setCourse({...course,name:e.target.value})}/></label><label>Modalidade<select value={course.modality} onChange={e=>setCourse({...course,modality:e.target.value})}><option>Online</option><option>Presencial</option><option>Híbrido</option></select></label><label>Responsável<input value={course.responsible} onChange={e=>setCourse({...course,responsible:e.target.value})}/></label><label>Início<input type="date" value={course.start} onChange={e=>setCourse({...course,start:e.target.value})}/></label><label>Término<input type="date" value={course.end} onChange={e=>setCourse({...course,end:e.target.value})}/></label><label>Descrição<input value={course.description} onChange={e=>setCourse({...course,description:e.target.value})}/></label></div><h3 className="subheading">Matérias</h3>{course.subjects.map((s,i)=><div className="subject" key={i}><input value={s.name} onChange={e=>updateSubject(i,"name",e.target.value)}/><input type="number" min="0" value={s.hours} onChange={e=>updateSubject(i,"hours",e.target.value)}/><span>h</span><button onClick={()=>removeSubject(i)}>×</button></div>)}<div className="actions"><button onClick={addSubject}>+ Adicionar matéria</button><button className="primary" onClick={saveCourse}>Salvar curso</button><button onClick={newCourse}>Novo curso</button></div></section>}
    {tab==="historico" && <section className="panel"><h2>Certificados emitidos</h2>{certs.length===0?<p className="empty">Nenhum certificado emitido ainda.</p>:<div className="cert-list">{certs.map(c=><div className="cert-row" key={c.code}><div><b>{c.name}</b><span>{c.code} • {c.hours}h • {c.status==="valid"?"Válido":"Cancelado"}</span></div><div><button onClick={()=>redownload(c)}>PDF</button><button onClick={()=>cancel(c.code)}>{c.status==="valid"?"Cancelar":"Revalidar"}</button></div></div>)}</div>}</section>}
    </main></div>
}

export function ValidarCertificado(){ const {code}=useParams(); const certs=load(KEY_CERTS,[]); const c=certs.find(x=>x.code===code); return <div className="validate-page"><div className="validate-card"><div className="validate-brand">ENAT • HSI</div>{c?<><div className={c.status==="valid"?"valid":"cancelled"}>{c.status==="valid"?"CERTIFICADO VÁLIDO":"CERTIFICADO CANCELADO"}</div><h1>Autenticidade do certificado</h1><dl><dt>Certificado</dt><dd>{c.code}</dd><dt>Aluno</dt><dd>{c.name}</dd><dt>CPF</dt><dd>{maskCPF(c.cpf)}</dd><dt>Curso</dt><dd>{c.course.name}</dd><dt>Carga horária</dt><dd>{c.hours} horas</dd><dt>Conclusão</dt><dd>{new Date(c.completionDate+"T12:00:00").toLocaleDateString("pt-BR")}</dd></dl><p className="small">Esta página confirma os dados registrados no emissor ENAT.</p></>:<><div className="cancelled">NÃO ENCONTRADO</div><h1>Certificado não localizado</h1><p>Verifique o código informado.</p></>}</div></div> }
