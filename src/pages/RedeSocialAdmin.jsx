import React,{useCallback,useEffect,useState}from"react";
import{supabase}from"../lib/supabaseClient";

const card={background:"#0c1b29",border:"1px solid rgba(99,202,255,.18)",borderRadius:16,padding:20};
const muted={color:"#8fa8ba",fontSize:13};
const btn={border:"1px solid rgba(99,202,255,.25)",background:"#0e2535",color:"#dff5ff",borderRadius:10,padding:"10px 14px",cursor:"pointer",fontWeight:800};
const danger={...btn,borderColor:"rgba(255,100,100,.35)",color:"#ffb8b8",background:"#24151a"};
const fmt=v=>Number(v||0).toLocaleString("pt-BR");
const date=v=>v?new Date(v).toLocaleString("pt-BR"):"—";

export function RedeSocialAdmin(){
 const[data,setData]=useState({profiles:[],posts:[],reports:[],communities:[],activity:[],assessments:[],counts:{profiles:0,posts:0,reports:0,communities:0,activity:0,assessments:0}});
 const[loading,setLoading]=useState(true),[error,setError]=useState(""),[tab,setTab]=useState("overview"),[busy,setBusy]=useState("");
 const load=useCallback(async()=>{
  if(!supabase){setError("Supabase da Central ENAT HSI não está configurado.");setLoading(false);return}
  setLoading(true);setError("");
  try{
   const[cP,cPo,cR,cC,cA,cH,pP,pPo,pR,pC,pA,pH]=await Promise.all([
    supabase.from("social_profiles").select("*",{count:"exact",head:true}),
    supabase.from("social_posts").select("*",{count:"exact",head:true}),
    supabase.from("social_reports").select("*",{count:"exact",head:true}),
    supabase.from("social_communities").select("*",{count:"exact",head:true}),
    supabase.from("cmnt_scientific_activity").select("*",{count:"exact",head:true}),
    supabase.from("hsi_doth_p_assessments").select("*",{count:"exact",head:true}),
    supabase.from("social_profiles").select("id,display_name,username,city,state,verified,created_at").order("created_at",{ascending:false}).limit(30),
    supabase.from("social_posts").select("id,author_id,content,media_type,location,visibility,created_at").order("created_at",{ascending:false}).limit(30),
    supabase.from("social_reports").select("id,reporter_id,post_id,reason,status,created_at").order("created_at",{ascending:false}).limit(30),
    supabase.from("social_communities").select("id,name,category,description,created_at").order("name").limit(50),
    supabase.from("cmnt_scientific_activity").select("id,user_id,session_id,section_key,action,metadata,created_at").order("created_at",{ascending:false}).limit(200),
    supabase.from("hsi_doth_p_assessments").select("id,user_id,decision_score,organization_score,time_score,humanization_score,psychocomportamental_score,total_score,interpretation,completed_at").order("completed_at",{ascending:false}).limit(100)
   ]);
   const errs=[cP,cPo,cR,cC,cA,cH,pP,pPo,pR,pC,pA,pH].filter(x=>x.error).map(x=>x.error.message);
   if(errs.length)throw new Error([...new Set(errs)].join(" • "));
   setData({profiles:pP.data||[],posts:pPo.data||[],reports:pR.data||[],communities:pC.data||[],activity:pA.data||[],assessments:pH.data||[],counts:{profiles:cP.count||0,posts:cPo.count||0,reports:cR.count||0,communities:cC.count||0,activity:cA.count||0,assessments:cH.count||0}});
  }catch(e){setError(e?.message||"Não foi possível carregar a administração da rede social.")}finally{setLoading(false)}
 },[]);
 useEffect(()=>{load();const t=window.setInterval(load,30000);return()=>window.clearInterval(t)},[load]);

 const updateReport=async(id,status)=>{
  setBusy("report:"+id);
  const r=await supabase.from("social_reports").update({status}).eq("id",id);
  setBusy("");if(r.error){setError(r.error.message);return}load();
 };
 const deletePost=async id=>{
  if(!window.confirm("Excluir esta publicação da rede social?"))return;
  setBusy("post:"+id);
  const r=await supabase.from("social_posts").delete().eq("id",id);
  setBusy("");if(r.error){setError(r.error.message);return}load();
 };

 const metric=(title,value,note)=><article style={card}><div style={muted}>{title}</div><strong style={{display:"block",fontSize:32,marginTop:8}}>{fmt(value)}</strong><span style={muted}>{note}</span></article>;
 return <main style={{minHeight:"100vh",background:"#07111b",color:"#eaf6ff",padding:"32px 24px",fontFamily:"Arial,sans-serif"}}>
  <div style={{maxWidth:1240,margin:"0 auto"}}>
   <header style={{display:"flex",justifyContent:"space-between",gap:20,alignItems:"flex-start",marginBottom:22,flexWrap:"wrap"}}>
    <div><div style={{...muted,letterSpacing:".12em"}}>PORTAL ADMINISTRATIVO · ENAT HSI</div><h1 style={{margin:"8px 0",fontSize:32}}>REDE SOCIAL — NEUROTRÂNSITO</h1><p style={{...muted,maxWidth:850,fontSize:15,lineHeight:1.6}}>Administração centralizada da rede social. O acesso é feito pela autenticação da Central ENAT HSI; não existe um segundo login administrativo.</p></div>
    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}><a href="https://neurotransito.hsi-doth-pg.com.br" target="_blank" rel="noreferrer" style={{...btn,textDecoration:"none"}}>🌐 Abrir Neurotrânsito</a><button onClick={load} disabled={loading} style={{...btn,opacity:loading?.6:1}}>{loading?"Atualizando…":"↻ Atualizar"}</button></div>
   </header>
   {error&&<div style={{...card,borderColor:"rgba(255,100,100,.35)",color:"#ffb8b8",marginBottom:18}}>Falha na integração: {error}</div>}
   <section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:14,marginBottom:18}}>
    {metric("USUÁRIOS",data.counts.profiles,"Perfis da rede")}
    {metric("PUBLICAÇÕES",data.counts.posts,"Conteúdos publicados")}
    {metric("DENÚNCIAS",data.counts.reports,"Registros de moderação")}
    {metric("COMUNIDADES",data.counts.communities,"Comunidades cadastradas")}{metric("MOVIMENTAÇÕES CIENTÍFICAS",data.counts.activity,"Navegações e ações registradas")}{metric("AVALIAÇÕES HSI-DOTH-P",data.counts.assessments,"Questionários concluídos")}
   </section>
   <nav style={{...card,padding:10,display:"flex",gap:8,flexWrap:"wrap",marginBottom:18}}>
    {[["overview","Visão geral"],["scientific","Ecossistema científico"],["activity","Atividade científica"],["hsi","HSI-DOTH-P"],["users","Usuários"],["posts","Publicações"],["reports","Denúncias"],["communities","Comunidades"]].map(([k,l])=><button key={k} onClick={()=>setTab(k)} style={{...btn,background:tab===k?"#12344a":"#0e1d2a",color:tab===k?"#63caff":"#dff5ff"}}>{l}</button>)}
   </nav>
   {loading&&!data.profiles.length?<section style={card}>Carregando dados da rede social…</section>:<>
    {tab==="scientific"&&<section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:18}}>
     <article style={card}><div style={muted}>ECOSSISTEMA</div><h2 style={{margin:"6px 0 14px"}}>Núcleos científicos</h2><p style={{...muted,lineHeight:1.7}}>Acompanhe a utilização das áreas de pesquisa, NEXUS 12, HSI-DOTH-P, observatório, evidências, governança e conhecimento.</p><div style={{display:"grid",gap:8,marginTop:12}}>{["Visão geral","Laboratório de pesquisa","Pesquisador","Evidências","NEXUS 12","HSI","Academia ENAT","Observatório","Eventos","Editorial","Comunidades científicas","Instituições","Governança","Base de conhecimento","Integrações","IA científica"].map(x=><div key={x} style={{...card,background:"#091824",padding:12}}><b>{x}</b></div>)}</div></article>
     <article style={card}><div style={muted}>ÚLTIMA ATIVIDADE</div><h2 style={{margin:"6px 0 14px"}}>Movimentações recentes</h2>{data.activity.slice(0,15).map(a=><div key={a.id} style={{padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,.07)"}}><b>{a.section_key}</b><div style={muted}>{a.action} · {date(a.created_at)}</div></div>)}{!data.activity.length&&<p style={muted}>Nenhuma movimentação registrada ainda.</p>}</article>
    </section>}
    {tab==="activity"&&<section style={card}><div style={muted}>RASTREABILIDADE</div><h2 style={{margin:"6px 0 16px"}}>Atividade do ecossistema científico</h2><p style={{...muted,lineHeight:1.6}}>Cada entrada registra a área acessada, a ação realizada, data/hora e metadados técnicos necessários para auditoria da plataforma.</p><div style={{overflowX:"auto",marginTop:14}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}><thead><tr>{["Data/hora","Usuário","Área","Ação","Metadados"].map(h=><th key={h} style={{textAlign:"left",padding:"10px 8px",borderBottom:"1px solid rgba(255,255,255,.1)",color:"#8fa8ba"}}>{h}</th>)}</tr></thead><tbody>{data.activity.map(a=><tr key={a.id}><td style={{padding:"10px 8px",borderBottom:"1px solid rgba(255,255,255,.06)"}}>{date(a.created_at)}</td><td style={{padding:"10px 8px",borderBottom:"1px solid rgba(255,255,255,.06)"}}>{a.user_id||"Visitante"}</td><td style={{padding:"10px 8px",borderBottom:"1px solid rgba(255,255,255,.06)"}}>{a.section_key}</td><td style={{padding:"10px 8px",borderBottom:"1px solid rgba(255,255,255,.06)"}}>{a.action}</td><td style={{padding:"10px 8px",borderBottom:"1px solid rgba(255,255,255,.06)",maxWidth:360,whiteSpace:"pre-wrap"}}>{JSON.stringify(a.metadata||{})}</td></tr>)}</tbody></table></div></section>}
    {tab==="hsi"&&<section style={card}><div style={muted}>HSI-DOTH-P</div><h2 style={{margin:"6px 0 16px"}}>Avaliações comportamentais registradas</h2><p style={{...muted,lineHeight:1.6}}>Resultados individuais do questionário HSI-DOTH-P, preservados para acompanhamento científico e administrativo. O instrumento não constitui diagnóstico clínico.</p>{data.assessments.map(a=><article key={a.id} style={{padding:"14px 0",borderBottom:"1px solid rgba(255,255,255,.08)"}}><div style={{display:"flex",justifyContent:"space-between",gap:14,flexWrap:"wrap"}}><div><b>Usuário: {a.user_id}</b><div style={muted}>{date(a.completed_at)} · {a.interpretation}</div></div><strong style={{fontSize:24}}>{Number(a.total_score||0).toFixed(1)}/100</strong></div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:8,marginTop:10}}>{[["Decisão",a.decision_score],["Organização",a.organization_score],["Tempo",a.time_score],["Humanização",a.humanization_score],["Psicocomportamental",a.psychocomportamental_score]].map(([k,v])=><div key={k} style={{...card,background:"#091824",padding:12}}><div style={muted}>{k}</div><b>{Number(v||0).toFixed(1)}</b></div>)}</div></article>)}{!data.assessments.length&&<p style={muted}>Nenhum HSI-DOTH-P concluído.</p>}</section>}
    {tab==="overview"&&<section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:18}}>
     <article style={card}><div style={muted}>ÚLTIMOS USUÁRIOS</div><h2 style={{margin:"6px 0 14px"}}>Cadastros recentes</h2>{data.profiles.slice(0,8).map(p=><div key={p.id} style={{padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,.07)"}}><b>{p.display_name||"Usuário"}</b><div style={muted}>@{p.username||"usuario"} · {p.city||"—"}/{p.state||"—"}</div></div>)}</article>
     <article style={card}><div style={muted}>MODERAÇÃO</div><h2 style={{margin:"6px 0 14px"}}>Denúncias recentes</h2>{data.reports.slice(0,8).map(r=><div key={r.id} style={{padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,.07)"}}><b>{r.reason||"Sem motivo"}</b><div style={muted}>Status: {r.status||"—"} · {date(r.created_at)}</div></div>)}{!data.reports.length&&<p style={muted}>Nenhuma denúncia registrada.</p>}</article>
     <article style={card}><div style={muted}>ESCOPO</div><h2 style={{margin:"6px 0 14px"}}>Administração central</h2><p style={{...muted,lineHeight:1.7}}>O Neurotrânsito permanece como aplicação pública da rede. Usuários, publicações, denúncias e comunidades são administrados a partir deste Portal Administrativo ENAT HSI.</p><p style={{...muted,lineHeight:1.7}}>O painel não duplica o login do Neurotrânsito e não altera a autenticação já existente do portal.</p></article>
    </section>}
    {tab==="users"&&<section style={card}><div style={muted}>PERFIS DA REDE</div><h2 style={{margin:"6px 0 16px"}}>Usuários recentes</h2><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}><thead><tr>{["Nome","Usuário","Localidade","Verificado","Cadastro"].map(h=><th key={h} style={{textAlign:"left",padding:"10px 8px",borderBottom:"1px solid rgba(255,255,255,.1)",color:"#8fa8ba"}}>{h}</th>)}</tr></thead><tbody>{data.profiles.map(p=><tr key={p.id}>{[p.display_name||"Usuário","@"+(p.username||"usuario"),(p.city||"—")+"/"+(p.state||"—"),p.verified?"Sim":"Não",date(p.created_at)].map((v,i)=><td key={i} style={{padding:"10px 8px",borderBottom:"1px solid rgba(255,255,255,.06)"}}>{v}</td>)}</tr>)}</tbody></table></div></section>}
    {tab==="posts"&&<section style={card}><div style={muted}>PUBLICAÇÕES</div><h2 style={{margin:"6px 0 16px"}}>Moderação de conteúdo</h2>{data.posts.map(p=><article key={p.id} style={{padding:"14px 0",borderBottom:"1px solid rgba(255,255,255,.08)"}}><div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"flex-start"}}><div style={{minWidth:0}}><div style={{...muted,marginBottom:5}}>{date(p.created_at)} · {p.visibility||"public"}{p.location?" · "+p.location:""}</div><div style={{whiteSpace:"pre-wrap",lineHeight:1.6}}>{p.content||"Sem texto"}</div><div style={{...muted,marginTop:5}}>Mídia: {p.media_type||"nenhuma"} · ID: {p.id}</div></div><button disabled={busy==="post:"+p.id} onClick={()=>deletePost(p.id)} style={{...danger,flexShrink:0}}>{busy==="post:"+p.id?"Excluindo…":"Excluir"}</button></div></article>)}{!data.posts.length&&<p style={muted}>Nenhuma publicação encontrada.</p>}</section>}
    {tab==="reports"&&<section style={card}><div style={muted}>MODERAÇÃO</div><h2 style={{margin:"6px 0 16px"}}>Denúncias</h2>{data.reports.map(r=><article key={r.id} style={{padding:"14px 0",borderBottom:"1px solid rgba(255,255,255,.08)"}}><div style={{display:"flex",justifyContent:"space-between",gap:14,alignItems:"center",flexWrap:"wrap"}}><div><b>{r.reason||"Sem motivo"}</b><div style={muted}>Publicação: {r.post_id||"—"} · {date(r.created_at)}</div><div style={muted}>Status atual: {r.status||"—"}</div></div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{["open","reviewed","resolved","dismissed"].map(s=><button key={s} disabled={busy==="report:"+r.id} onClick={()=>updateReport(r.id,s)} style={{...btn,background:r.status===s?"#12344a":"#0e1d2a",fontSize:12}}>{s}</button>)}</div></div></article>)}{!data.reports.length&&<p style={muted}>Nenhuma denúncia encontrada.</p>}</section>}
    {tab==="communities"&&<section style={card}><div style={muted}>COMUNIDADES</div><h2 style={{margin:"6px 0 16px"}}>Comunidades científicas e sociais</h2><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:12}}>{data.communities.map(c=><article key={c.id} style={{...card,background:"#091824"}}><b>{c.name}</b><div style={{...muted,marginTop:5}}>{c.category||"Sem categoria"}</div><p style={{...muted,lineHeight:1.5}}>{c.description||"Sem descrição."}</p></article>)}</div>{!data.communities.length&&<p style={muted}>Nenhuma comunidade encontrada.</p>}</section>}
   </>}
  </div>
 </main>
}
