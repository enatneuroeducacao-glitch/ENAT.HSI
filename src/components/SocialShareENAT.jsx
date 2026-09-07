import {useEffect,useRef,useState} from "react";

export function SocialShareENAT({title,url}){
  const [copied,setCopied]=useState(false);
  const shareRef=useRef(null);
  const target=url||window.location.href;
  const text=title||"Conteúdo ENAT";
  const isArticle=target.includes("conteudo=")||target.includes("/artigo/");
  let articleTarget=target;
  try{if(target.includes("conteudo="))articleTarget=`${window.location.origin}/artigo/${encodeURIComponent(new URL(target).searchParams.get("conteudo"))}`}catch{}

  useEffect(()=>{
    if(!isArticle||!shareRef.current)return;
    const card=shareRef.current.closest("article");
    if(!card)return;
    const open=()=>window.location.assign(articleTarget);
    card.classList.add("editorial-card-clickable");
    card.addEventListener("click",open);
    return()=>{card.removeEventListener("click",open);card.classList.remove("editorial-card-clickable")};
  },[isArticle,articleTarget]);

  const stop=e=>e.stopPropagation();
  const native=async e=>{stop(e);try{if(navigator.share){await navigator.share({title:text,text:`${text} — ENAT`,url:articleTarget});return;}await navigator.clipboard.writeText(articleTarget);setCopied(true);setTimeout(()=>setCopied(false),1800)}catch{}};
  const copy=async e=>{stop(e);try{await navigator.clipboard.writeText(articleTarget);setCopied(true);setTimeout(()=>setCopied(false),1800)}catch{window.prompt("Copie o link do conteúdo:",articleTarget)}};
  const links=[
    ["WhatsApp","https://wa.me/?text="+encodeURIComponent(`${text} — ${articleTarget}`),"◔"],
    ["Facebook","https://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent(articleTarget),"f"],
    ["LinkedIn","https://www.linkedin.com/sharing/share-offsite/?url="+encodeURIComponent(articleTarget),"in"],
    ["X","https://twitter.com/intent/tweet?text="+encodeURIComponent(text)+"&url="+encodeURIComponent(articleTarget),"𝕏"]
  ];
  const iconStyle={width:36,height:36,borderRadius:"50%",display:"inline-grid",placeItems:"center",fontWeight:900,fontSize:13,textDecoration:"none",border:"1px solid #cfe0ec",background:"#fff",color:"#163b58",cursor:"pointer",transition:"transform .18s ease,box-shadow .18s ease,background .18s ease"};
  return <div ref={shareRef} className="social-share social-share-modern" aria-label="Compartilhar conteúdo" onClick={stop}>
    {isArticle&&<button type="button" className="social-share-read" onClick={e=>{stop(e);window.location.assign(articleTarget)}} style={{border:0,borderRadius:999,padding:"10px 16px",fontWeight:900,background:"linear-gradient(135deg,#0b86d8,#075a9d)",color:"#fff",cursor:"pointer",boxShadow:"0 6px 18px rgba(7,105,170,.2)"}}>↗ Ler artigo</button>}
    <span style={{fontSize:12,fontWeight:900,letterSpacing:".08em",textTransform:"uppercase",color:"#607488"}}>Compartilhar</span>
    <button type="button" onClick={native} title="Compartilhamento do dispositivo" style={iconStyle}>↗</button>
    {links.map(([label,href,icon])=><a key={label} href={href} target="_blank" rel="noreferrer noopener" aria-label={`Compartilhar no ${label}`} title={`Compartilhar no ${label}`} onClick={stop} style={iconStyle}>{icon}</a>)}
    <button type="button" onClick={copy} title="Copiar link" style={{...iconStyle,width:42,borderRadius:999,fontSize:11}}>{copied?"✓":"🔗"}</button>
  </div>
}
