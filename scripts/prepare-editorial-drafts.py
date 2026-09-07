from pathlib import Path

p = Path("src/pages/CaixaEntradaPublicaENAT.jsx")
s = p.read_text(encoding="utf-8")

marker = 'function EditorialEditor({ editing, onSaved, onCancel }) {'
if marker not in s:
    raise SystemExit("EditorialEditor marker not found; stopped safely.")

# Persist the editor locally immediately, then mirror valid drafts to Supabase.
# This prevents loss when navigating away, refreshing, or experiencing a remount/session hiccup.
helper = r'''const EDITORIAL_DRAFT_KEY = "enat_editorial_draft_v2";
const readEditorialDraft = () => {
  try { return JSON.parse(localStorage.getItem(EDITORIAL_DRAFT_KEY) || "null"); } catch { return null; }
};
const writeEditorialDraft = (draft) => {
  try { localStorage.setItem(EDITORIAL_DRAFT_KEY, JSON.stringify({ ...draft, saved_at: new Date().toISOString() })); } catch {}
};
const clearEditorialDraft = () => { try { localStorage.removeItem(EDITORIAL_DRAFT_KEY); } catch {} };

'''
s = s.replace(marker, helper + marker, 1)

old_init = '''  const [form, setForm] = useState(
    editing ? { ...editing, tags: Array.isArray(editing.tags) ? editing.tags.join(", ") : "" } : { ...emptyEditorial }
  );
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const set = (key, value) => setForm((old) => ({ ...old, [key]: value }));
'''
new_init = '''  const [draft] = useState(() => !editing ? readEditorialDraft() : null);
  const [form, setForm] = useState(() => editing
    ? { ...editing, tags: Array.isArray(editing.tags) ? editing.tags.join(", ") : "" }
    : { ...emptyEditorial, ...(draft || {}), published: draft?.published ?? true }
  );
  const [draftId, setDraftId] = useState(() => !editing ? (draft?.id || null) : null);
  const [busy, setBusy] = useState(false);
  const [autosaving, setAutosaving] = useState(false);
  const [msg, setMsg] = useState(() => !editing && draft ? "Rascunho recuperado automaticamente." : "");
  const set = (key, value) => setForm((old) => ({ ...old, [key]: value }));

  useEffect(() => {
    if (editing) return undefined;
    writeEditorialDraft({ ...form, id: draftId || undefined });
    const timer = setTimeout(async () => {
      const title = String(form.title || "").trim();
      const content = String(form.content || "").trim();
      if (!title || !content) return;
      setAutosaving(true);
      try {
        const payload = {
          ...form,
          published: false,
          tags: String(form.tags || "").split(",").map((x) => x.trim()).filter(Boolean),
        };
        const data = await cmsCall(draftId ? "update_editorial" : "create_editorial", {
          id: draftId || undefined,
          editorial: payload,
        });
        if (!draftId && data?.editorial?.id) setDraftId(data.editorial.id);
        writeEditorialDraft({ ...form, id: data?.editorial?.id || draftId || undefined });
        setMsg("Rascunho salvo automaticamente.");
      } catch (error) {
        setMsg("Rascunho local preservado. " + (error.message || "Sincronização pendente."));
      } finally { setAutosaving(false); }
    }, 1500);
    return () => clearTimeout(timer);
  }, [form, draftId, editing]);

  useEffect(() => {
    if (editing) return undefined;
    const warn = (event) => {
      if (String(form.title || "").trim() || String(form.content || "").trim()) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [editing, form.title, form.content]);
'''
if old_init not in s:
    raise SystemExit("Editorial state block not found; stopped safely.")
s = s.replace(old_init, new_init, 1)

old_save = '''      const data = await cmsCall(editing ? "update_editorial" : "create_editorial", {
        id: editing?.id,
        editorial: {
          ...form,
          tags: String(form.tags || "").split(",").map((x) => x.trim()).filter(Boolean),
        },
      });
      setMsg("Publicação salva.");
      onSaved(data.editorial);
'''
new_save = '''      const recordId = editing?.id || draftId;
      const data = await cmsCall(recordId ? "update_editorial" : "create_editorial", {
        id: recordId || undefined,
        editorial: {
          ...form,
          published: form.published !== false,
          tags: String(form.tags || "").split(",").map((x) => x.trim()).filter(Boolean),
        },
      });
      clearEditorialDraft();
      setMsg(form.published === false ? "Rascunho salvo com sucesso." : "Publicação salva com sucesso.");
      onSaved(data.editorial);
'''
if old_save not in s:
    raise SystemExit("Editorial save block not found; stopped safely.")
s = s.replace(old_save, new_save, 1)

old_title = '<h2 style={{ margin: 0 }}>{editing ? "Editar publicação" : "Nova publicação"}</h2>'
new_title = '<h2 style={{ margin: 0 }}>{editing ? "Editar publicação" : "Nova publicação"}</h2><div style={{ color: "#8fa5b5", fontSize: 12 }}>{autosaving ? "Salvando rascunho…" : (!editing && (draftId || form.title || form.content) ? "✓ Rascunho preservado automaticamente" : "O conteúdo é preservado enquanto você edita.")}</div>'
if old_title not in s:
    raise SystemExit("Editorial title marker not found; stopped safely.")
s = s.replace(old_title, new_title, 1)

# Do not inject additional JSX into the CMS list here. The draft is recovered when
# the user opens "Nova publicação", which keeps the existing CMS structure intact.
p.write_text(s, encoding="utf-8")
print("Editorial drafts prepared: local persistence, server autosave and navigation protection.")
