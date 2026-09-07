import {useEffect,useMemo,useState} from "react";
import {Link,useParams} from "react-router-dom";
import {supabase} from "../lib/supabaseClient";

function getArticleText(row){
  if(!row)return "";
  const metadata=row.metadata&&typeof row.metadata==="object"?row.metadata:{};
  return row.content||row.body||row.content_html||row.body_html||row.text||metadata.content||metadata.body||metadata.content_html||metadata.body_html||"";
}

function renderText(content){
  if(!content)return <p>O conteúdo completo deste artigo ainda não foi disponibilizado.</p>;
  if(/<\/?[a-z][\s\S]*>/i.test(content))return <div dangerouslySetInnerHTML={{__html:content}}/>;
  return <>{String(content).split(/\n{2,}/).map((p,i)=><p key={i}>{p}</p>)}</>;
}

export function ArticleReaderENAT(){
  const {id}=useParams();
  const [article,setArticle]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const shareUrl=useMemo(()=>window.location.href,[id]);

  useEffect(()=>{
    let alive=true;
    async function load(){
      try{
        setLoading(true);
        setError("");
        const result=await supabase.from("enat_public_editorial").select("*").eq("id",id).eq("published",true).maybeSingle();
        if(result.error)throw result.error;
        if(!result.data)throw new Error("Artigo não encontrado ou ainda não publicado.");
        if(alive)setArticle(result.data);
      }catch(err){
        if(alive)setError(err?.message||"Não foi possível carregar o artigo.");
      }finally{
        if(alive)setLoading(false);
      }
    }
    load();
    return()=>{alive=false};
  },[id]);

  const title=article?.title||"Artigo ENAT";
  const content=getArticleText(article);
  const whatsapp=`https://wa.me/?text=${encodeURIComponent(`${title} — ${shareUrl}`)}`;
  const facebook=`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const linkedin=`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

  if(loading)return <main style={styles.page}><div style={styles.loading}>Carregando artigo…</div></main>;
  if(error)return <main style={styles.page}><div style={styles.error}><Link to="/portal" style={styles.back}>← Artigos & Notícias</Link><h1>Não foi possível abrir o artigo</h1><p>{error}</p><p>Volte para Artigos & Notícias e tente novamente.</p></div></main>;

  return <main style={styles.page}>
    <div style={styles.top}><Link to="/portal" style={styles.back}>← Artigos & Notícias</Link><span style={styles.brand}>ENAT · HSI</span></div>
    <article style={styles.article}>
      <div style={styles.kicker}>{article?.kind==="news"?"NOTÍCIA":"ARTIGO"}</div>
      <h1 style={styles.title}>{title}</h1>
      <div style={styles.meta}>{article?.author_name||"ENAT"}{article?.category?` · ${article.category}`:""}{article?.published_at?` · ${new Date(article.published_at).toLocaleDateString("pt-BR")}`:""}</div>
      {article?.image_url&&<img src={article.image_url} alt={title} style={styles.cover}/>} 
      {article?.summary&&<div style={styles.summary}><strong>Resumo</strong><p>{article.summary}</p></div>}
      <div style={styles.content}>{renderText(content)}</div>
      <div style={styles.share}>
        <strong>Compartilhar</strong>
        <a href={whatsapp} target="_blank" rel="noreferrer" style={styles.shareButton}>WhatsApp</a>
        <a href={facebook} target="_blank" rel="noreferrer" style={styles.shareButton}>Facebook</a>
        <a href={linkedin} target="_blank" rel="noreferrer" style={styles.shareButton}>LinkedIn</a>
        <button type="button" style={styles.shareButton} onClick={async()=>{try{await navigator.clipboard.writeText(shareUrl);alert("Link copiado.")}catch{window.prompt("Copie o link do artigo:",shareUrl)}}}>Copiar link</button>
      </div>
    </article>
  </main>;
}

const styles={
  page:{minHeight:"100vh",background:"#f4f7fa",color:"#172638",fontFamily:"Inter,Arial,sans-serif",paddingBottom:70},
  top:{height:64,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 6vw",background:"#07111b",borderBottom:"1px solid #20394d"},
  brand:{color:"#8bd4ff",fontWeight:900,letterSpacing:".08em"},
  back:{color:"#83d0ff",fontWeight:800,textDecoration:"none"},
  article:{width:"min(900px,calc(100% - 32px))",margin:"42px auto 0",background:"#fff",border:"1px solid #dce6ed",borderRadius:18,boxShadow:"0 18px 55px rgba(20,45,70,.08)",padding:"clamp(24px,5vw,58px)"},
  kicker:{display:"inline-block",background:"#e4f5ff",color:"#0877b9",borderRadius:999,padding:"7px 11px",fontSize:11,fontWeight:900,letterSpacing:".12em"},
  title:{fontSize:"clamp(34px,5vw,58px)",lineHeight:1.08,letterSpacing:"-.035em",margin:"18px 0 12px",color:"#10263b"},
  meta:{fontSize:14,color:"#708397",marginBottom:28},
  cover:{display:"block",width:"100%",maxHeight:520,objectFit:"cover",borderRadius:14,marginBottom:30},
  summary:{background:"#f2f8fc",borderLeft:"4px solid #0b86d8",padding:"18px 20px",borderRadius:"0 10px 10px 0",marginBottom:34,color:"#53687b",lineHeight:1.65},
  content:{fontFamily:"Georgia,Times New Roman,serif",fontSize:19,lineHeight:1.85,color:"#263b4f"},
  share:{display:"flex",flexWrap:"wrap",alignItems:"center",gap:9,marginTop:36,paddingTop:20,borderTop:"1px solid #e2e9ee",fontSize:13},
  shareButton:{display:"inline-flex",alignItems:"center",justifyContent:"center",padding:"9px 13px",borderRadius:999,border:"1px solid #cddde8",background:"#fff",color:"#15577e",textDecoration:"none",fontWeight:800,cursor:"pointer"},
  loading:{padding:80,textAlign:"center",color:"#466174"},
  error:{width:"min(760px,calc(100% - 32px))",margin:"70px auto",background:"#fff",padding:40,borderRadius:16,border:"1px solid #dce6ed"}
};
