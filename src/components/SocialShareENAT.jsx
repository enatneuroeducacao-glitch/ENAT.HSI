import {useState} from "react";

export function SocialShareENAT({title,url}){
  const [copied,setCopied]=useState(false);
  const target=url||window.location.href;
  const text=title||"Conteúdo ENAT";
  const native=async()=>{try{if(navigator.share){await navigator.share({title:text,text:`${text} — ENAT`,url:target});return;}await navigator.clipboard.writeText(target);setCopied(true);setTimeout(()=>setCopied(false),1800)}catch(e){}};
  const copy=async()=>{try{await navigator.clipboard.writeText(target);setCopied(true);setTimeout(()=>setCopied(false),1800)}catch(e){window.prompt("Copie o link do conteúdo:",target)}};
  const links=[
    ["WhatsApp",`https://wa.me/?text=${encodeURIComponent(`${text} — ${target}`)}`],
    ["Facebook",`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(target)}`],
    ["LinkedIn",`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(target)}`],
    ["X",`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(target)}`]
  ];
  return <div className="social-share" aria-label="Compartilhar conteúdo"><span>Compartilhar</span><button type="button" onClick={native} title="Compartilhamento do dispositivo">↗ Compartilhar</button>{links.map(([label,href])=><a key={label} href={href} target="_blank" rel="noreferrer noopener">{label}</a>)}<button type="button" onClick={copy}>{copied?"Link copiado ✓":"Copiar link"}</button></div>
}
