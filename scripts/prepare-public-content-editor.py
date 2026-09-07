from pathlib import Path

p = Path("src/pages/CaixaEntradaPublicaENAT.jsx")
s = p.read_text(encoding="utf-8")

# The public-site configuration screen is a separate administrative function.
# "Editar site" must open that screen; "Blocos da página" remains the CMS block editor.
old_site_button = '<button onClick={() => setTab("cms")} style={buttonStyle}>🧩 Editor do site</button>'
new_site_button = '<button onClick={() => { window.location.href = "/configuracao-portal"; }} style={buttonStyle}>⚙️ Editar site</button>'
if old_site_button not in s:
    raise SystemExit("Expected site-editor button was not found; stopped safely.")
s = s.replace(old_site_button, new_site_button, 1)

# Reuse the same Supabase Storage bucket already used by ConfiguracaoPortalENAT.
# Files are uploaded from the browser and the database continues to store only the
# resulting public URL, so existing records remain compatible.
marker = 'function ContentEditor({ editing, onSaved, onCancel }) {'
helper = r'''async function uploadPublicImage(file) {
  if (!file) return "";
  if (!file.type.startsWith("image/")) throw new Error("Selecione uma imagem válida.");
  if (file.size > 15 * 1024 * 1024) throw new Error("A imagem deve ter no máximo 15 MB.");
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `portal/content-${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("enat-public-assets").upload(path, file, {
    upsert: false,
    contentType: file.type,
    cacheControl: "31536000",
  });
  if (error) throw error;
  return supabase.storage.from("enat-public-assets").getPublicUrl(path).data.publicUrl;
}

function PublicImageField({ label, value, onChange }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const choose = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      onChange(await uploadPublicImage(file));
    } catch (err) {
      setError(err.message || "Falha ao enviar imagem.");
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  };
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <span>{label}</span>
      <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif" onChange={choose} disabled={busy} style={{ ...inputStyle, padding: 9 }} />
      <small style={{ color: "#7890a4" }}>{busy ? "Enviando imagem…" : "PNG, JPG, WEBP, SVG ou GIF · máximo 15 MB"}</small>
      {value && <img src={value} alt="Pré-visualização" style={{ maxWidth: "100%", maxHeight: 180, objectFit: "contain", borderRadius: 8, border: "1px solid #31506b", background: "#07111b" }} />}
      {error && <div style={{ color: "#ffb4b4", fontSize: 12 }}>{error}</div>}
      <input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="Ou informe uma URL pública" style={inputStyle} />
    </div>
  );
}

'''
if marker not in s:
    raise SystemExit("ContentEditor marker not found; stopped safely.")
s = s.replace(marker, helper + marker, 1)

old_content_image = '<label style={labelStyle}>Imagem (URL)<input value={form.image_url || ""} onChange={(e) => set("image_url", e.target.value)} style={inputStyle} /></label>'
new_content_image = '<PublicImageField label="Imagem" value={form.image_url || ""} onChange={(value) => set("image_url", value)} />'
if s.count(old_content_image) < 1:
    raise SystemExit("Content image field was not found; stopped safely.")
s = s.replace(old_content_image, new_content_image, 1)

old_editorial_image = '<label style={labelStyle}>Imagem (URL)<input value={form.image_url || ""} onChange={(e) => set("image_url", e.target.value)} style={inputStyle} /></label>'
new_editorial_image = '<PublicImageField label="Imagem de capa" value={form.image_url || ""} onChange={(value) => set("image_url", value)} />'
if old_editorial_image not in s:
    raise SystemExit("Editorial image field was not found; stopped safely.")
s = s.replace(old_editorial_image, new_editorial_image, 1)

# Make the CMS navigation explicit so the two functions cannot appear to be the same screen.
old_cms_button = '<button onClick={() => setView("content")} style={buttonStyle}>🧩 Blocos da página</button>'
new_cms_button = '<button onClick={() => setView("content")} style={{ ...buttonStyle, fontWeight: 800 }}>🧩 Blocos da página</button>'
if old_cms_button in s:
    s = s.replace(old_cms_button, new_cms_button, 1)

p.write_text(s, encoding="utf-8")
print("Public content editor prepared: separate site settings + direct image upload for blocks and editorials.")
