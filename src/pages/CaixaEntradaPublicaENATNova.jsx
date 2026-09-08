import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const labels = {
  interest: "Interesse",
  article_submission: "Artigo enviado",
  news_submission: "Notícia enviada",
  contact: "Contato",
};

const statusLabels = {
  new: "Nova",
  review: "Em análise",
  contacted: "Respondida",
  archived: "Arquivada",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  borderRadius: 7,
  border: "1px solid #31506b",
  background: "#081622",
  color: "#e6f1fa",
};

const buttonStyle = {
  padding: "9px 13px",
  borderRadius: 6,
  border: "1px solid #31506b",
  background: "#14283b",
  color: "#dbe8f2",
  cursor: "pointer",
};

const primaryButton = {
  ...buttonStyle,
  background: "#82c8f7",
  color: "#07111b",
  fontWeight: 800,
};

function getSubject(row) {
  return row?.subject || row?.title || `${labels[row?.kind] || "Contato"} — ENAT HSI`;
}

function getMessage(row) {
  return row?.content || row?.summary || row?.message || "";
}

function MailComposer({ mode, message, onClose, onSent }) {
  const isReply = mode === "reply";
  const [to, setTo] = useState(isReply ? message.email || "" : "");
  const [cc, setCc] = useState("");
  const [subject, setSubject] = useState(
    isReply ? `Re: ${getSubject(message).replace(/^Re:\s*/i, "")}` : `Encaminhamento: ${getSubject(message)}`
  );
  const [body, setBody] = useState(
    isReply
      ? "\n\n--- Mensagem original ---\n" + getMessage(message)
      : "\n\n--- Mensagem encaminhada ---\nDe: " + (message.email || "") + "\nAssunto: " + getSubject(message) + "\n\n" + getMessage(message)
  );
  const [error, setError] = useState("");

  const send = (event) => {
    event.preventDefault();
    setError("");
    if (!to.trim()) {
      setError("Informe pelo menos um destinatário.");
      return;
    }
    const params = new URLSearchParams();
    if (subject.trim()) params.set("subject", subject.trim());
    if (body.trim()) params.set("body", body.trim());
    if (cc.trim()) params.set("cc", cc.trim());
    window.location.href = `mailto:${to.trim()}?${params.toString()}`;
    onSent();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.78)", display: "grid", placeItems: "center", padding: 20, zIndex: 80 }}>
      <form onSubmit={send} style={{ background: "#0d1b29", border: "1px solid #31506b", borderRadius: 12, width: "min(850px, 100%)", maxHeight: "92vh", overflow: "auto", padding: 26, boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            <div style={{ color: "#82c8f7", fontSize: 12, fontWeight: 800, letterSpacing: 1.5 }}>{isReply ? "RESPONDER" : "ENCAMINHAR"}</div>
            <h2 style={{ margin: "6px 0 18px" }}>{isReply ? "Responder mensagem" : "Encaminhar mensagem"}</h2>
          </div>
          <button type="button" onClick={onClose} style={buttonStyle}>Fechar</button>
        </div>
        <div style={{ display: "grid", gap: 13 }}>
          <label>Para<input value={to} onChange={(e) => setTo(e.target.value)} placeholder="destinatario@exemplo.com" style={{ ...inputStyle, marginTop: 6 }} /></label>
          <label>Cc<input value={cc} onChange={(e) => setCc(e.target.value)} placeholder="Opcional" style={{ ...inputStyle, marginTop: 6 }} /></label>
          <label>Assunto<input value={subject} onChange={(e) => setSubject(e.target.value)} style={{ ...inputStyle, marginTop: 6 }} /></label>
          <label>Mensagem<textarea rows={13} value={body} onChange={(e) => setBody(e.target.value)} style={{ ...inputStyle, marginTop: 6, resize: "vertical", lineHeight: 1.5 }} /></label>
          {error && <div style={{ padding: 10, border: "1px solid #754848", background: "#24171b", color: "#ffb4b4" }}>{error}</div>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button type="button" onClick={onClose} style={buttonStyle}>Cancelar</button>
            <button type="submit" style={primaryButton}>✉️ Enviar</button>
          </div>
          <div style={{ fontSize: 12, color: "#7f95a7" }}>O botão Enviar abrirá o aplicativo de e-mail configurado no computador, com os campos já preenchidos.</div>
        </div>
      </form>
    </div>
  );
}

export function CaixaEntradaPublicaENATNova() {
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [compose, setCompose] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setMsg("");
    let query = supabase.from("enat_public_inbox").select("*").order("created_at", { ascending: false });
    if (filter !== "all") query = query.eq("kind", filter);
    const { data, error } = await query;
    if (error) setMsg(error.message || "Não foi possível carregar a caixa de entrada.");
    else setRows(data || []);
  };

  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (id, status) => {
    setBusy(true);
    const { error } = await supabase.from("enat_public_inbox").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) setMsg(error.message || "Não foi possível atualizar a mensagem.");
    else {
      setRows((old) => old.map((row) => row.id === id ? { ...row, status } : row));
      setSelected((old) => old?.id === id ? { ...old, status } : old);
    }
    setBusy(false);
  };

  const deleteMessage = async (row) => {
    if (!window.confirm(`Excluir definitivamente a mensagem de ${row.name || row.email || "este contato"}?`)) return;
    setBusy(true);
    const { error } = await supabase.from("enat_public_inbox").delete().eq("id", row.id);
    if (error) setMsg(error.message || "Não foi possível excluir a mensagem.");
    else {
      setRows((old) => old.filter((item) => item.id !== row.id));
      setSelected(null);
    }
    setBusy(false);
  };

  const counts = useMemo(() => ({
    total: rows.length,
    new: rows.filter((r) => r.status === "new").length,
    contacted: rows.filter((r) => r.status === "contacted").length,
  }), [rows]);

  return (
    <main style={{ minHeight: "100vh", background: "#07111b", color: "#e6f1fa", padding: "105px 28px 50px", fontFamily: "Arial,sans-serif" }}>
      <div style={{ maxWidth: 1250, margin: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <div style={{ color: "#82c8f7", fontSize: 12, fontWeight: 800, letterSpacing: 2 }}>CENTRAL ENAT HSI</div>
            <h1 style={{ margin: "8px 0" }}>Caixa de entrada pública</h1>
            <p style={{ color: "#9db1c1", marginBottom: 0 }}>Mensagens recebidas pelo site — atendimento administrativo.</p>
          </div>
          <button onClick={() => { window.location.href = "/portal"; }} style={buttonStyle}>🌐 Ver site público</button>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "22px 0" }}>
          <button onClick={() => { window.location.href = "/configuracao-portal"; }} style={buttonStyle}>🧩 Editor do site</button>
          <div style={{ padding: "9px 12px", border: "1px solid #31506b", borderRadius: 6, color: "#9db1c1" }}>📨 Caixa de entrada</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10, marginBottom: 18 }}>
          <div style={{ padding: 15, background: "#0d1b29", border: "1px solid #203b52", borderRadius: 9 }}><div style={{ color: "#7890a4", fontSize: 12 }}>MENSAGENS</div><strong style={{ fontSize: 24 }}>{counts.total}</strong></div>
          <div style={{ padding: 15, background: "#0d1b29", border: "1px solid #203b52", borderRadius: 9 }}><div style={{ color: "#7890a4", fontSize: 12 }}>NOVAS</div><strong style={{ fontSize: 24 }}>{counts.new}</strong></div>
          <div style={{ padding: 15, background: "#0d1b29", border: "1px solid #203b52", borderRadius: 9 }}><div style={{ color: "#7890a4", fontSize: 12 }}>RESPONDIDAS</div><strong style={{ fontSize: 24 }}>{counts.contacted}</strong></div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
          <div><h2 style={{ margin: 0 }}>Mensagens</h2><p style={{ margin: "5px 0 0", color: "#8fa5b5" }}>Ações de atendimento: responder, encaminhar, arquivar e excluir.</p></div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: 180 }}>
            <option value="all">Todos</option>
            {Object.entries(labels).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
          </select>
        </div>

        {msg && <div style={{ margin: "18px 0", padding: 12, background: "#24171b", border: "1px solid #754848", color: "#ffb4b4" }}>{msg}</div>}

        <div style={{ display: "grid", gap: 10 }}>
          {rows.map((row) => (
            <button key={row.id} onClick={() => setSelected(row)} style={{ textAlign: "left", padding: 18, borderRadius: 9, border: "1px solid #203b52", background: "#0d1b29", color: "#e6f1fa", cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                <div>
                  <strong>{getSubject(row)}</strong>
                  <div style={{ color: "#9db1c1", marginTop: 6 }}>{row.name || "Sem nome"} · {row.email || "sem e-mail"}</div>
                </div>
                <span style={{ fontSize: 12, padding: "4px 8px", borderRadius: 5, border: "1px solid #31506b", color: row.status === "new" ? "#82c8f7" : "#9db1c1" }}>{statusLabels[row.status] || row.status || "Nova"}</span>
              </div>
              <div style={{ marginTop: 9, color: "#7890a4", fontSize: 12 }}>{labels[row.kind] || "Contato"}</div>
            </button>
          ))}
          {!rows.length && <div style={{ padding: 35, textAlign: "center", border: "1px dashed #31506b", color: "#91a5b5" }}>Nenhuma mensagem recebida ainda.</div>}
        </div>
      </div>

      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "grid", placeItems: "center", padding: 20, zIndex: 50 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#0d1b29", border: "1px solid #31506b", borderRadius: 12, maxWidth: 850, width: "100%", maxHeight: "90vh", overflow: "auto", padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
              <div><div style={{ color: "#82c8f7", fontSize: 12, fontWeight: 800 }}>MENSAGEM RECEBIDA</div><h2 style={{ margin: "7px 0 15px" }}>{getSubject(selected)}</h2></div>
              <button onClick={() => setSelected(null)} style={buttonStyle}>Fechar</button>
            </div>
            <p><strong>Nome:</strong> {selected.name || "—"}</p>
            <p><strong>E-mail:</strong> {selected.email || "—"}</p>
            <p><strong>WhatsApp:</strong> {selected.phone || "—"}</p>
            <p><strong>Tipo:</strong> {labels[selected.kind] || "Contato"}</p>
            <p><strong>Status:</strong> {statusLabels[selected.status] || selected.status || "Nova"}</p>
            <hr style={{ borderColor: "#203b52", margin: "20px 0" }} />
            <h3>Mensagem</h3>
            <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{getMessage(selected) || "Sem conteúdo informado."}</p>

            {Array.isArray(selected.attachments) && selected.attachments.length > 0 && (
              <section><h3>📎 Documentos anexados</h3><div style={{ display: "grid", gap: 8 }}>{selected.attachments.map((a, i) => <div key={a.path || i} style={{ padding: 10, border: "1px solid #203b52", borderRadius: 7 }}>📄 {a.name || `Documento ${i + 1}`}</div>)}</div></section>
            )}

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 24, paddingTop: 18, borderTop: "1px solid #203b52" }}>
              <button disabled={busy || !selected.email} onClick={() => setCompose("reply")} style={primaryButton}>↩ Responder</button>
              <button disabled={busy} onClick={() => setCompose("forward")} style={buttonStyle}>↗ Encaminhar</button>
              <button disabled={busy} onClick={() => updateStatus(selected.id, "archived")} style={buttonStyle}>🗄 Arquivar</button>
              <button disabled={busy} onClick={() => deleteMessage(selected)} style={{ ...buttonStyle, borderColor: "#754848", background: "#24171b", color: "#ffb4b4" }}>🗑 Excluir</button>
            </div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 12 }}>
              <span style={{ fontSize: 12, color: "#7890a4", marginRight: 4 }}>Status:</span>
              {Object.entries(statusLabels).map(([status, label]) => <button key={status} disabled={busy} onClick={() => updateStatus(selected.id, status)} style={{ ...buttonStyle, padding: "6px 9px", fontSize: 12 }}>{label}</button>)}
            </div>
          </div>
        </div>
      )}

      {compose && selected && <MailComposer mode={compose} message={selected} onClose={() => setCompose(null)} onSent={() => { setCompose(null); updateStatus(selected.id, "contacted"); }} />}
    </main>
  );
}
