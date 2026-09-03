import React, { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { cancelCertificate, getSession, issueCertificate, listCertificates, signIn, signOut, signUp } from "../lib/certificatesApi";
import "./EmissorCertificadosAdmin.css";

const COURSE_KEY = "enat_certificate_course_v2";
const INSTITUTION_KEY = "enat_certificate_institution_v2";
const BRAND_KEY = "enat_certificate_brand_v2";
const BRAND_DB = "enat-certificate-brand";
const BRAND_STORE = "assets";

const defaultCourse = {
  name: "ENAT — Ensino Neuroeducacional Aplicado ao Trânsito",
  nature: "Curso Livre de Formação e Aperfeiçoamento",
  modality: "Online",
  responsible: "ENAT — Ensino Neuroeducacional Aplicado ao Trânsito",
  responsibleRole: "Responsável Técnico",
  subjects: [
    ["Legislação e Normas de Trânsito", 20],
    ["Psicologia, Neurociência e Comportamento", 25],
    ["Direção Defensiva e Percepção de Risco", 20],
    ["Infrações e Responsabilidade", 15],
    ["Mecânica Básica", 10],
    ["Primeiros Socorros", 10],
    ["Meio Ambiente, Ética e Cidadania", 20],
  ],
};
const defaultInstitution = { name: "ENAT — Ensino Neuroeducacional Aplicado ao Trânsito", cnpj: "" };
const defaultBrand = { enatLogo: "", neuroLogo: "" };

const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "") || fallback;
  } catch {
    return fallback;
  }
};
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const onlyDigits = (value) => String(value || "").replace(/\D/g, "");
const totalHours = (course) => course.subjects.reduce((sum, item) => sum + Number(item[1] || 0), 0);
const minimumDaysForHours = (hours) => Math.ceil((Number(hours) / 24) * 7);
const formatDateBR = (value) => value ? new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR") : "";
const maskCpf = (value) => {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
};
const maskCnpj = (value) => {
  const d = onlyDigits(value).slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
};

async function hashCpf(cpf) {
  const bytes = new TextEncoder().encode(onlyDigits(cpf));
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function imageFormat(data) {
  const source = String(data || "").toLowerCase();
  return source.startsWith("data:image/jpeg") || source.startsWith("data:image/jpg") ? "JPEG" : "PNG";
}

function getImageSize(data) {
  return new Promise((resolve) => {
    if (!data) return resolve({ w: 1, h: 1 });
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth || 1, h: img.naturalHeight || 1 });
    img.onerror = () => resolve({ w: 1, h: 1 });
    img.src = data;
  });
}

async function addImageContain(doc, data, x, y, maxW, maxH) {
  if (!data) return false;
  try {
    const { w, h } = await getImageSize(data);
    if (w <= 1 || h <= 1) return false;
    const ratio = Math.min(maxW / w, maxH / h);
    const dw = w * ratio;
    const dh = h * ratio;
    doc.addImage(data, imageFormat(data), x + (maxW - dw) / 2, y + (maxH - dh) / 2, dw, dh, undefined, "FAST");
    return true;
  } catch {
    return false;
  }
}

async function makeWatermarkData(data, opacity = 0.1) {
  if (!data) return null;
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || 1200;
        canvas.height = img.naturalHeight || 1000;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = opacity;
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = data;
  });
}

async function addWatermark(doc, data, width, height) {
  if (!data) return;
  try {
    const faded = await makeWatermarkData(data, 0.1);
    if (!faded) return;
    const { w, h } = await getImageSize(faded);
    const maxW = 112;
    const maxH = 100;
    const ratio = Math.min(maxW / w, maxH / h);
    const dw = w * ratio;
    const dh = h * ratio;
    doc.addImage(faded, "PNG", width / 2 - dw / 2, height / 2 - dh / 2, dw, dh, undefined, "FAST");
  } catch {}
}

function drawPageFrame(doc, width, height) {
  doc.setFillColor(8, 14, 24);
  doc.rect(0, 0, width, height, "F");
  doc.setDrawColor(70, 190, 240);
  doc.setLineWidth(1.2);
  doc.rect(10, 10, width - 20, height - 20);
}

function openBrandDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") return reject(new Error("IndexedDB indisponível"));
    const request = indexedDB.open(BRAND_DB, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(BRAND_STORE)) request.result.createObjectStore(BRAND_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Não foi possível abrir o armazenamento das logos."));
  });
}

async function getBrandAssets() {
  try {
    const db = await openBrandDb();
    return await new Promise((resolve) => {
      const tx = db.transaction(BRAND_STORE, "readonly");
      const store = tx.objectStore(BRAND_STORE);
      const request = store.get("logos");
      request.onsuccess = () => resolve(request.result || {});
      request.onerror = () => resolve({});
    });
  } catch {
    return {};
  }
}

async function setBrandAssets(assets) {
  const db = await openBrandDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(BRAND_STORE, "readwrite");
    tx.objectStore(BRAND_STORE).put(assets, "logos");
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error || new Error("Não foi possível salvar a logo."));
  });
}

function fileToData(file, setter) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => setter(String(reader.result));
  reader.readAsDataURL(file);
}

export function EmissorCertificadosAdmin() {
  const [session, setSession] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState("emitir");
  const [course, setCourse] = useState(() => read(COURSE_KEY, defaultCourse));
  const [institution, setInstitution] = useState(() => read(INSTITUTION_KEY, defaultInstitution));
  const [brand, setBrand] = useState(defaultBrand);
  const [brandReady, setBrandReady] = useState(false);
  const [student, setStudent] = useState({ name: "", cpf: "", startDate: "", endDate: "" });
  const [certs, setCerts] = useState([]);

  const hours = useMemo(() => totalHours(course), [course]);
  const minimumDays = useMemo(() => minimumDaysForHours(hours), [hours]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const stored = await getBrandAssets();
      const legacy = read(BRAND_KEY, defaultBrand);
      const merged = {
        enatLogo: stored.enatLogo || legacy.enatLogo || "",
        neuroLogo: stored.neuroLogo || legacy.neuroLogo || "",
      };
      if (mounted) {
        setBrand(merged);
        setBrandReady(true);
      }
      if (merged.enatLogo || merged.neuroLogo) await setBrandAssets(merged).catch(() => {});
    })();
    return () => { mounted = false; };
  }, []);

  const refresh = async () => {
    try {
      setCerts((await listCertificates()).certificates || []);
    } catch (error) {
      setMessage(error.message);
    }
  };

  useEffect(() => {
    getSession().then((current) => {
      setSession(current);
      if (current) refresh();
    }).catch((error) => setMessage(error.message));
  }, []);

  const updateBrand = async (key, value) => {
    const next = { ...brand, [key]: value };
    setBrand(next);
    try {
      await setBrandAssets(next);
      save(BRAND_KEY, next);
    } catch {
      try { save(BRAND_KEY, next); } catch {}
    }
  };

  const removeBrand = async (key) => {
    const next = { ...brand, [key]: "" };
    setBrand(next);
    try { await setBrandAssets(next); } catch {}
    try { save(BRAND_KEY, next); } catch {}
    setMessage(`${key === "enatLogo" ? "Logo ENAT" : "Logo Neurociência Aplicada ao Trânsito"} excluída.`);
  };

  const auth = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const current = authMode === "login" ? await signIn(email, password) : await signUp(email, password);
      setSession(current);
      setMessage(authMode === "login" ? "Acesso autorizado." : "Conta criada. Se o projeto exigir confirmação de e-mail, confirme-a antes de entrar.");
      if (current) refresh();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  const makePdf = async (certificate) => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const W = 297;
    const H = 210;
    const startDate = certificate.start_date || certificate.completion_date;
    const endDate = certificate.end_date || certificate.completion_date;
    const periodText = `compreendida entre ${formatDateBR(startDate)} e ${formatDateBR(endDate)}`;

    drawPageFrame(doc, W, H);
    await addWatermark(doc, brand.neuroLogo, W, H);
    doc.setTextColor(210, 240, 250);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text("CERTIFICADO", W / 2, 38, { align: "center" });
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(certificate.course_nature || course.nature, W / 2, 48, { align: "center" });
    await addImageContain(doc, brand.enatLogo, 18, 16, 36, 36);
    await addImageContain(doc, brand.neuroLogo, 243, 16, 36, 36);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(certificate.student_name, W / 2, 76, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Certificamos que o(a) participante acima identificado(a)", W / 2, 89, { align: "center" });
    doc.text("concluiu com êxito o curso de", W / 2, 98, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(certificate.course_name, W / 2, 109, { align: "center", maxWidth: 235 });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Formação baseada em Neurociência Aplicada ao Trânsito, com carga horária de ${certificate.hours} horas, ${periodText}.`, W / 2, 121, { align: "center", maxWidth: 235 });
    doc.setFontSize(9);
    doc.text(`Instituição: ${certificate.institution_name || institution.name}`, 20, 140);
    if (certificate.institution_cnpj) doc.text(`CNPJ: ${maskCnpj(certificate.institution_cnpj)}`, 20, 147);
    doc.text(`Responsável: ${certificate.responsible || course.responsible} — ${certificate.responsible_role || course.responsibleRole}`, 20, 154);
    doc.text(`Registro: ${certificate.code}`, 20, 161);
    const qr = await QRCode.toDataURL(`${window.location.origin}/validar/${certificate.code}`, { margin: 1, width: 180 });
    doc.addImage(qr, "PNG", 245, 145, 30, 30);
    doc.setFontSize(7);
    doc.text("Validação pública por QR Code", 260, 179, { align: "center" });
    doc.setDrawColor(160, 190, 200);
    doc.line(105, 174, 195, 174);
    doc.setFontSize(9);
    doc.text(certificate.responsible || course.responsible, 150, 181, { align: "center" });
    doc.setFontSize(7);
    doc.text("Curso livre de formação, capacitação, aperfeiçoamento ou atualização. Este certificado não corresponde a diploma de graduação nem a certificado de pós-graduação lato sensu ou título acadêmico reconhecido pelo MEC.", W / 2, 195, { align: "center", maxWidth: 250 });

    doc.addPage();
    drawPageFrame(doc, W, H);
    await addWatermark(doc, brand.neuroLogo, W, H);
    doc.setTextColor(210, 240, 250);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("CONTEÚDO PROGRAMÁTICO", W / 2, 32, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(certificate.course_name, W / 2, 41, { align: "center" });
    await addImageContain(doc, brand.enatLogo, 20, 16, 30, 30);
    await addImageContain(doc, brand.neuroLogo, 247, 16, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Componente curricular", 22, 56);
    doc.text("Carga horária", 214, 56);
    doc.setDrawColor(70, 190, 240);
    doc.line(20, 60, 277, 60);

    const subjects = Array.isArray(certificate.subjects) && certificate.subjects.length
      ? certificate.subjects
      : course.subjects.map(([name, subjectHours]) => ({ name, hours: Number(subjectHours) }));
    let y = 70;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    subjects.forEach((subject, index) => {
      const name = typeof subject === "string" ? subject : subject.name || subject[0] || "";
      const subjectHours = Number(subject.hours ?? subject[1] ?? 0);
      if (index % 2 === 0) {
        doc.setFillColor(15, 28, 42);
        doc.rect(20, y - 7, 257, 9, "F");
      }
      doc.setTextColor(220, 235, 242);
      doc.text(String(name), 22, y, { maxWidth: 185 });
      doc.text(`${subjectHours} h`, 214, y);
      y += 11;
    });

    doc.setDrawColor(70, 190, 240);
    doc.line(20, y - 5, 277, y - 5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`Carga horária total: ${certificate.hours} horas`, 22, y + 7);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`Aluno: ${certificate.student_name} • Registro: ${certificate.code} • Modalidade: ${certificate.modality || course.modality}`, 22, y + 18, { maxWidth: 245 });

    const legalY = Math.min(y + 29, 157);
    doc.setDrawColor(70, 190, 240);
    doc.rect(20, legalY, 257, 30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("INFORMAÇÕES LEGAIS — CURSO LIVRE", 24, legalY + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    const legalText = "Conforme orientação do Ministério da Educação — MEC/SERES, cursos livres caracterizam-se pela ausência de atos autorizativos por parte do Poder Público. Este certificado comprova a participação/conclusão e a carga horária do curso realizado, mas não corresponde a diploma de curso superior, não confere grau acadêmico e não constitui certificado de conclusão de pós-graduação lato sensu. Sua aceitação para fins profissionais, institucionais, concursos, processos seletivos ou aproveitamento de estudos depende das normas aplicáveis pela instituição ou órgão destinatário.";
    doc.text(legalText, 24, legalY + 12, { maxWidth: 248, lineHeightFactor: 1.35 });
    doc.setFontSize(6.5);
    doc.text("Referência: Ministério da Educação — MEC/SERES — Perguntas Frequentes: Cursos Livres.", 24, legalY + 26, { maxWidth: 248 });
    doc.setFontSize(6.5);
    doc.text("Documento integrante do certificado. Os componentes curriculares e respectivas cargas horárias correspondem à configuração registrada pela instituição emissora.", W / 2, 198, { align: "center", maxWidth: 250 });

    doc.save(`${certificate.code}_${certificate.student_name.replace(/[^a-z0-9]+/gi, "_")}.pdf`);
  };

  const emit = async () => {
    if (!student.name.trim() || onlyDigits(student.cpf).length !== 11) {
      setMessage("Informe nome completo e CPF válido.");
      return;
    }
    if (!student.startDate || !student.endDate) {
      setMessage("Informe obrigatoriamente a data de início e a data de fim do curso.");
      return;
    }
    const start = new Date(`${student.startDate}T00:00:00`);
    const end = new Date(`${student.endDate}T00:00:00`);
    const durationDays = Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
    if (durationDays < minimumDays) {
      const weeks = Math.ceil(hours / 24);
      setMessage(`Período insuficiente. Para ${hours} horas, o certificado exige no mínimo ${minimumDays} dias (${weeks} semanas). O período informado possui ${durationDays} dias.`);
      return;
    }
    if (!brandReady) {
      setMessage("Aguarde o carregamento das logos antes de emitir o certificado.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const cpf_hash = await hashCpf(student.cpf);
      const response = await issueCertificate({
        student_name: student.name.trim(),
        cpf_hash,
        course_name: course.name,
        course_nature: course.nature,
        hours,
        subjects: course.subjects.map(([name, subjectHours]) => ({ name, hours: Number(subjectHours) })),
        start_date: student.startDate,
        end_date: student.endDate,
        completion_date: student.endDate,
        responsible: course.responsible,
        institution_name: institution.name,
        institution_cnpj: onlyDigits(institution.cnpj),
        responsible_role: course.responsibleRole,
        modality: course.modality,
      });
      const certificate = response.certificate;
      await makePdf(certificate);
      setMessage(`Certificado ${certificate.code} emitido com sucesso.`);
      setStudent({ name: "", cpf: "", startDate: "", endDate: "" });
      refresh();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  const cancel = async (certificate) => {
    try {
      await cancelCertificate(certificate.code, certificate.status === "valid" ? "cancelled" : "valid");
      refresh();
    } catch (error) {
      setMessage(error.message);
    }
  };

  if (!session) {
    return (
      <main className="issuer">
        <section className="issuer-card auth-card">
          <div className="issuer-brand">ENAT HSI</div>
          <h1>Emissor de Certificados</h1>
          <p>Acesso administrativo da Central ENAT HSI</p>
          <form onSubmit={auth}>
            <input type="email" placeholder="E-mail" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <input type="password" placeholder="Senha" value={password} onChange={(event) => setPassword(event.target.value)} required />
            <button disabled={busy}>{busy ? "Processando…" : authMode === "login" ? "Entrar no emissor" : "Criar acesso"}</button>
          </form>
          <button className="link-btn" onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}>
            {authMode === "login" ? "Ainda não tenho acesso" : "Já tenho acesso"}
          </button>
          {message && <div className="issuer-message">{message}</div>}
        </section>
      </main>
    );
  }

  const updateCourseField = (field, value) => {
    const next = { ...course, [field]: value };
    setCourse(next);
    save(COURSE_KEY, next);
  };

  const updateSubject = (index, field, value) => {
    const nextSubjects = course.subjects.map((subject, subjectIndex) => {
      if (subjectIndex !== index) return subject;
      return field === "name" ? [value, subject[1]] : [subject[0], Number(value || 0)];
    });
    const next = { ...course, subjects: nextSubjects };
    setCourse(next);
    save(COURSE_KEY, next);
  };

  const addSubject = () => {
    const next = { ...course, subjects: [...course.subjects, ["Novo componente curricular", 0]] };
    setCourse(next);
    save(COURSE_KEY, next);
  };

  const removeSubject = (index) => {
    const next = { ...course, subjects: course.subjects.filter((_, itemIndex) => itemIndex !== index) };
    setCourse(next);
    save(COURSE_KEY, next);
  };

  return (
    <main className="issuer">
      <header className="issuer-head">
        <div>
          <span>ENAT HSI</span>
          <h1>Emissor de Certificados</h1>
          <p>Emissão, configuração institucional e validação documental.</p>
        </div>
        <button className="secondary" onClick={() => { signOut(); setSession(null); }}>Sair</button>
      </header>

      <nav className="issuer-tabs">
        <button className={tab === "emitir" ? "active" : ""} onClick={() => setTab("emitir")}>Emitir</button>
        <button className={tab === "curso" ? "active" : ""} onClick={() => setTab("curso")}>Curso e instituição</button>
        <button className={tab === "certificados" ? "active" : ""} onClick={() => setTab("certificados")}>Certificados ({certs.length})</button>
      </nav>

      {message && <div className="issuer-message">{message}</div>}

      {tab === "emitir" && (
        <section className="issuer-grid">
          <article className="issuer-card">
            <h2>Novo certificado</h2>
            <label>Nome completo<input value={student.name} onChange={(event) => setStudent({ ...student, name: event.target.value })} /></label>
            <label>CPF<input value={maskCpf(student.cpf)} onChange={(event) => setStudent({ ...student, cpf: event.target.value })} /></label>
            <label>Data de início<input type="date" value={student.startDate} onChange={(event) => setStudent({ ...student, startDate: event.target.value })} required /></label>
            <label>Data de fim<input type="date" value={student.endDate} min={student.startDate || undefined} onChange={(event) => setStudent({ ...student, endDate: event.target.value })} required /></label>
            <div className="summary">
              <b>{course.name}</b>
              <span>{hours} horas • período mínimo: {minimumDays} dias ({Math.ceil(hours / 24)} semanas)</span>
              <span>{institution.name}</span>
            </div>
            <button onClick={emit} disabled={busy || !brandReady}>{busy ? "Emitindo…" : !brandReady ? "Carregando identidade…" : "Emitir e gerar PDF"}</button>
          </article>

          <article className="issuer-card">
            <h2>Identidade do certificado</h2>
            <div className="logo-row">
              {brand.enatLogo ? <img src={brand.enatLogo} alt="Logo ENAT" /> : <div className="logo-placeholder">ENAT</div>}
              {brand.neuroLogo ? <img src={brand.neuroLogo} alt="Neurociência Aplicada ao Trânsito" /> : <div className="logo-placeholder">Neurociência</div>}
            </div>
            <p className="hint">As logos ficam armazenadas no navegador e permanecem após atualizar a página. Elas só são removidas quando você clicar em <b>Excluir logo</b>.</p>
            <label>Logo ENAT<input type="file" accept="image/png,image/jpeg" onChange={(event) => fileToData(event.target.files?.[0], (value) => updateBrand("enatLogo", value))} /></label>
            {brand.enatLogo && <button type="button" className="secondary" onClick={() => removeBrand("enatLogo")}>Excluir logo ENAT</button>}
            <label>Logo Neurociência Aplicada ao Trânsito<input type="file" accept="image/png,image/jpeg" onChange={(event) => fileToData(event.target.files?.[0], (value) => updateBrand("neuroLogo", value))} /></label>
            {brand.neuroLogo && <button type="button" className="secondary" onClick={() => removeBrand("neuroLogo")}>Excluir logo Neurociência</button>}
          </article>
        </section>
      )}

      {tab === "curso" && (
        <section className="issuer-grid">
          <article className="issuer-card">
            <h2>Curso</h2>
            <label>Nome<input value={course.name} onChange={(event) => updateCourseField("name", event.target.value)} /></label>
            <label>Natureza<input value={course.nature} onChange={(event) => updateCourseField("nature", event.target.value)} /></label>
            <label>Modalidade<input value={course.modality} onChange={(event) => updateCourseField("modality", event.target.value)} /></label>
            <label>Responsável<input value={course.responsible} onChange={(event) => updateCourseField("responsible", event.target.value)} /></label>
            <label>Função do responsável<input value={course.responsibleRole} onChange={(event) => updateCourseField("responsibleRole", event.target.value)} /></label>
            <div className="summary"><b>Carga horária total</b><span>{hours} horas • período mínimo de {minimumDays} dias ({Math.ceil(hours / 24)} semanas)</span></div>
          </article>
          <article className="issuer-card">
            <h2>Componentes curriculares</h2>
            {course.subjects.map((subject, index) => (
              <div key={`${index}-${subject[0]}`} className="subject-row">
                <input value={subject[0]} onChange={(event) => updateSubject(index, "name", event.target.value)} />
                <input type="number" min="0" value={subject[1]} onChange={(event) => updateSubject(index, "hours", event.target.value)} />
                <button type="button" className="secondary" onClick={() => removeSubject(index)}>Excluir</button>
              </div>
            ))}
            <button type="button" onClick={addSubject}>Adicionar componente</button>
          </article>
          <article className="issuer-card">
            <h2>Instituição</h2>
            <label>Nome<input value={institution.name} onChange={(event) => { const next = { ...institution, name: event.target.value }; setInstitution(next); save(INSTITUTION_KEY, next); }} /></label>
            <label>CNPJ<input value={maskCnpj(institution.cnpj)} onChange={(event) => { const next = { ...institution, cnpj: event.target.value }; setInstitution(next); save(INSTITUTION_KEY, next); }} /></label>
          </article>
        </section>
      )}

      {tab === "certificados" && (
        <section className="issuer-card">
          <h2>Certificados emitidos</h2>
          {!certs.length && <p>Nenhum certificado encontrado.</p>}
          {certs.map((certificate) => (
            <div key={certificate.id || certificate.code} className="certificate-row">
              <div>
                <b>{certificate.code}</b>
                <span>{certificate.student_name} • {certificate.course_name} • {certificate.hours}h • {certificate.status}</span>
              </div>
              <div>
                <button onClick={() => makePdf(certificate)}>📄 Baixar PDF</button>
                <button className="secondary" onClick={() => cancel(certificate)}>{certificate.status === "valid" ? "Cancelar" : "Revalidar"}</button>
              </div>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
