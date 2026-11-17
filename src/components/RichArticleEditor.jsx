import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const allowedTags = new Set(["P","H2","H3","H4","STRONG","B","EM","I","U","UL","OL","LI","BLOCKQUOTE","A","IMG","FIGURE","FIGCAPTION","HR","BR"]);
const safeUrl = (value, image = false) => {
  try {
    const url = new URL(value, window.location.origin);
    return ["http:", "https:"].includes(url.protocol) && (!image || url.protocol === "https:") ? url.href : "";
  } catch { return ""; }
};
const escapeHtml = (value) => String(value || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
const toHtml = (value) => {
  const text = String(value || "");
  if (/<(p|h[2-4]|ul|ol|li|blockquote|figure|img|br|strong|em)(\s|>|\/)/i.test(text)) return text;
  return text.split(/\r?\n/).map(line => line.trim() ? `<p>${escapeHtml(line)}</p>` : "<p><br></p>").join("");
};
function safeNodes(nodes, keyPrefix = "n") {
  return Array.from(nodes).map((node, index) => {
    const key = keyPrefix + index;
    if (node.nodeType === Node.TEXT_NODE) return node.nodeValue;
    if (node.nodeType !== Node.ELEMENT_NODE) return null;
    const tag = node.tagName.toLowerCase();
    const children = safeNodes(node.childNodes, key);
    if (!allowedTags.has(node.tagName)) return children;
    if (tag === "img") {
      const src = safeUrl(node.getAttribute("src") || "", true);
      if (!src) return null;
      return <img key={key} src={src} alt={node.getAttribute("alt") || ""} title={node.getAttribute("title") || undefined} loading="lazy" />;
    }
    if (tag === "a") {
      const href = safeUrl(node.getAttribute("href") || "");
      return href ? <a key={key} href={href} target="_blank" rel="noopener noreferrer">{children}</a> : <span key={key}>{children}</span>;
    }
    const Tag = tag;
    return <Tag key={key}>{children}</Tag>;
  });
}
export function RichArticleContent({ content }) {
  const html = toHtml(content);
  const doc = new DOMParser().parseFromString(html, "text/html");
  return <div className="enat-rich-article-content">{safeNodes(doc.body.childNodes)}</div>;
}

export function RichArticleEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = toHtml(value);
  }, []);

  const command = (name, arg = null) => {
    editorRef.current?.focus();
    document.execCommand(name, false, arg);
    onChange(editorRef.current?.innerHTML || "");
  };
  const insertLink = () => {
    const url = window.prompt("Informe o endereço do link (https://...):");
    if (!url) return;
    const safe = safeUrl(url);
    if (!safe) { setMessage("Informe um endereço HTTP ou HTTPS válido."); return; }
    command("createLink", safe);
  };
  const uploadImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg","image/png","image/webp","image/gif"].includes(file.type)) {
      setMessage("Formato não permitido. Utilize JPG, PNG, WEBP ou GIF."); return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setMessage("A imagem deve ter no máximo 8 MB."); return;
    }
    setUploading(true); setMessage("");
    try {
      const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g,"") || "jpg";
      const path = `articles/${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage.from("enat-public-assets").upload(path, file, {
        cacheControl: "31536000", contentType: file.type, upsert: false
      });
      if (error) throw error;
      const { data } = supabase.storage.from("enat-public-assets").getPublicUrl(path);
      const alt = window.prompt("Descrição da imagem (texto alternativo):", file.name.replace(/\.[^.]+$/, "")) || "";
      const caption = window.prompt("Legenda da imagem (opcional):", "") || "";
      const figure = `<figure><img src="${escapeHtml(data.publicUrl)}" alt="${escapeHtml(alt)}" /><figcaption>${escapeHtml(caption)}</figcaption></figure><p><br></p>`;
      editorRef.current?.focus();
      document.execCommand("insertHTML", false, figure);
      onChange(editorRef.current?.innerHTML || "");
      setMessage("Imagem inserida no artigo.");
    } catch (error) {
      setMessage(error.message || "Não foi possível enviar a imagem.");
    } finally { setUploading(false); }
  };
  const toolbar = [
    ["bold","Negrito"],["italic","Itálico"],["underline","Sublinhado"],
    ["formatBlock","Título 2","h2"],["formatBlock","Título 3","h3"],
    ["insertUnorderedList","Lista"],["insertOrderedList","Lista numerada"],
    ["formatBlock","Citação","blockquote"]
  ];
  return <div className="enat-rich-editor">
    <div className="enat-rich-toolbar" role="toolbar" aria-label="Formatação do artigo">
      {toolbar.map(([action,label,arg]) => <button type="button" key={action+label} onMouseDown={e=>e.preventDefault()} onClick={()=>command(action,arg ? `<${arg}>` : null)}>{label}</button>)}
      <button type="button" onMouseDown={e=>e.preventDefault()} onClick={insertLink}>Inserir link</button>
      <button type="button" className="enat-image-tool" disabled={uploading} onMouseDown={e=>e.preventDefault()} onClick={()=>fileRef.current?.click()}>{uploading?"Enviando imagem…":"＋ Inserir imagem"}</button>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={uploadImage}/>
    </div>
    <div ref={editorRef} className="enat-rich-editable" contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true" aria-label="Conteúdo do artigo" data-placeholder="Escreva seu artigo. Use a barra acima para formatar e inserir imagens." onInput={e=>onChange(e.currentTarget.innerHTML)} />
    {message && <div className="enat-rich-message" role="status">{message}</div>}
    <style>{`
      .enat-rich-editor{display:grid;gap:8px}.enat-rich-toolbar{display:flex;flex-wrap:wrap;gap:6px;padding:9px;background:#10263a;border:1px solid #31506b;border-radius:8px}
      .enat-rich-toolbar button{border:1px solid #42617a;border-radius:6px;background:#18364e;color:#e6f1fa;padding:7px 10px;cursor:pointer;font-size:12px}
      .enat-rich-toolbar button:disabled{opacity:.55;cursor:wait}.enat-rich-toolbar .enat-image-tool{background:#145a49;border-color:#278a70;font-weight:700}
      .enat-rich-editable{min-height:340px;max-height:680px;overflow:auto;padding:16px;border:1px solid #31506b;border-radius:8px;background:#081622;color:#e6f1fa;line-height:1.75;outline:none}
      .enat-rich-editable:empty:before{content:attr(data-placeholder);color:#7890a4}.enat-rich-editable img{display:block;max-width:100%;height:auto;margin:12px auto;border-radius:8px}
      .enat-rich-editable figure{margin:18px auto;text-align:center}.enat-rich-editable figcaption{font-size:12px;color:#a9bdcc}
      .enat-rich-editable blockquote{border-left:3px solid #55b9ee;padding-left:14px;color:#b9c9d6}
      .enat-rich-article-content{line-height:1.8;color:inherit;overflow-wrap:anywhere}.enat-rich-article-content img{display:block;max-width:100%;height:auto;margin:18px auto;border-radius:10px}
      .enat-rich-article-content figure{margin:24px auto;text-align:center}.enat-rich-article-content figcaption{font-size:.9em;color:#71869a;margin-top:6px}
      .enat-rich-article-content blockquote{border-left:4px solid #299bd3;padding:8px 18px;margin:20px 0;background:rgba(41,155,211,.08)}
      .enat-rich-article-content h2,.enat-rich-article-content h3{line-height:1.3;margin:1.5em 0 .6em}.enat-rich-article-content p{margin:.8em 0}
    `}</style>
  </div>;
}
