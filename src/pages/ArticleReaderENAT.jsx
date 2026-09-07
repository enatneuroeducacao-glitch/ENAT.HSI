import {useEffect,useMemo,useState} from "react";
import {Link,useNavigate,useParams} from "react-router-dom";
import {BrandingENAT} from "../components/BrandingENAT";
import {SocialShareENAT} from "../components/SocialShareENAT";
import {supabase} from "../lib/supabaseClient";

function pickContent(row){
  return row?.content ?? row?.body ?? row?.content_html ?? row?.body_html ?? row?.text ?? "";
}

function isHtml(value){
  return typeof value === "string" && /<\/?[a-z][\s\S]*>/i.test(value);
}

export function ArticleReaderENAT(){
  const {id}=useParams();
  const nav=useNavigate();
  const [article,setArticle]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");

  useEffect(()=>{
    let active=true;
    (async()=>{
      setLoading(true); setError("");
      try{
        const {data,error}=await supabase.from("enat_public_editorial").select("*").eq("id",id).eq("published",true).maybeSingle();
        if(error) throw error;
        if(!data) throw new Error("Este conteúdo não está disponível para leitura pública.");
        if(active) setArticle(data);
      }catch(e){
        if(active) setError(e.message||"Não foi possível carregar o artigo.");
      }finally{if(active)setLoading(false)}
    })();
    return()=>{active=false};
  },[id]);

  const shareUrl=useMemo(()=>`${window.location.origin}/artigo/${encodeURIComponent(id||"")}`,[id]);
  const content=pickContent(article);

  if(loading) return <main className="article-reader"><div className="article-reader-shell"><p>Carregando artigo…</p></div></main>;
  if(error) return <main className="article-reader"><div className="article-reader-shell"><Link className="article-back" to="/portal">← Voltar para Artigos & Notícias</Link><div className="article-error"><h1>Não foi possível abrir o artigo</h1><p>{error}</p></div></div></main>;

  return <main className="article-reader">
    <header className="article-reader-header">
      <Link to="/portal" className="article-reader-brand"><BrandingENAT variant="header"/></Link>
      <button type="button" className="article-close" onClick={()=>nav("/portal")}>← Artigos & Notícias</button>
    </header>
    <article className="article-reader-shell">
      <div className="article-reader-kicker">{article?.kind==="news"?"NOTÍCIA":"ARTIGO"}</div>
      <h1>{article?.title||"Conteúdo ENAT"}</h1>
      {(article?.author_name||article?.category||article?.published_at)&&<div className="article-reader-meta">{article?.author_name||"ENAT"}{article?.category?` · ${article.category}`:""}{article?.published_at?` · ${new Date(article.published_at).toLocaleDateString("pt-BR")}`:""}</div>}
      {article?.image_url&&<img className="article-reader-cover" src={article.image_url} alt={article.title||"Imagem do artigo"}/>}      
      {article?.summary&&<div className="article-reader-summary"><strong>Resumo</strong><p>{article.summary}</p></div>}
      <div className="article-reader-content">
        {content ? (isHtml(content)?<div dangerouslySetInnerHTML={{__html:content}}/>:<div>{content.split(/\n{2,}/).map((p,i)=><p key={i}>{p}</p>)}</div>) : <p>O conteúdo completo deste artigo ainda não foi disponibilizado.</p>}
      </div>
      <div className="article-reader-share"><SocialShareENAT title={article?.title||"Conteúdo ENAT"} url={shareUrl}/></div>
      <Link className="article-back-bottom" to="/portal">← Voltar para Artigos & Notícias</Link>
    </article>
  </main>;
}
