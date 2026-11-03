import React,{useCallback,useEffect,useState}from"react";
import{supabase}from"../lib/supabaseClient";

const panel={background:"#0c1b29",border:"1px solid rgba(99,202,255,.18)",borderRadius:16,padding:20};
const muted={color:"#8fa8ba",fontSize:13};
const btn={border:"1px solid rgba(99,202,255,.25)",background:"#0e2535",color:"#dff5ff",borderRadius:10,padding:"10px 14px",cursor:"pointer",fontWeight:800};
const date=v=>v?new Date(v).toLocaleString("pt-BR"):"—";
const statuses=[["new","Novo"],["reviewing","Em análise"],["contacted","Contatado"],["proposal_sent","Proposta enviada"],["closed","Encerrado"]];

export function ParceriasAdmin(){
 const[rows,setRows]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(""),[notice,setNotice]=useState(""),[busy,setBusy]=useState("");
 const load=useCallback(async()=>{
  if(!supabase){setError("Supabase da Central ENAT HSI não está configurado.");setLoading(false);return}
  setLoading(true);setError("");
  try{
   const r=await supabase.from("cmnt_sponsorship_leads").select("id,name,company,email,whatsapp,interest_type,message,consent,status,created_at").order("created_at",{ascending:false}).limit(500);
   if(r.error)throw r.error;
   setRows(r.data||[]);
  }catch(e){setError("Não foi possível consultar as solicitações de parceria: "+(e?.message||"erro desconhecido"))}
  finally{setLoading(false)}
 },[]);
 useEffect(()=>{load()},[load]);
 const changeStatus=async(id,status)=>{
  setBusy(id);setError("");setNotice("");
  try{
   const r=await supabase.from("cmnt_sponsorship_leads").update({status}).eq("id",id).select("id,status").single();
   if(r.error)throw r.error;
   setRows(old=>old.map(x=>x.id===id?{...x,status:r.data.status}:x));
   setNotice("Status atualizado e salvo no banco de dados.");
  }catch(e){setError("Não foi possível atualizar o status: "+(e?.message||"verifique as permissões da tabela."))}
  finally{setBusy("")}
 };
 const count=s=>rows.filter(r=>r.status===s).length;
 return <div style={{boxSizing:"border-box",width:"100%",minWidth:0,minHeight:"100%",background:"transparent",color:"#eaf6ff",padding:0,fontFamily:"Arial,sans-serif"}}>
  <div style={{maxWidth:1240,margin:"0 auto"}}>
   <div style={{...muted,letterSpacing:".12em"}}>PORTAL ADMINISTRATIVO · ENAT HSI</div>
   <h1 style={{margin:"8px 0",fontSize:32}}>INTERESSADOS EM PARCERIAS</h1>
   <p style={{...muted,fontSize:15,lineHeight:1.6,maxWidth:850}}>Solicitações recebidas pelo formulário público do Neurotrânsito. Consulte os dados, acompanhe o andamento e atualize o status da proposta.</p>
   <div style={{display:"flex",gap:8,flexWrap:"wrap",margin:"18px 0"}}>
    <button style={btn} onClick={load} disabled={loading}>{loading?"Atualizando…":"↻ Atualizar lista"}</button>
    <a href="https://neurotransito.hsi-doth-pg.com.br" target="_blank" rel="noreferrer" style={{...btn,textDecoration:"none"}}>Abrir Neurotrânsito ↗</a>
   </div>
   {error&&<div role="alert" style={{...panel,borderColor:"#a52a2a",color:"#ffb8b8",marginBottom:16}}>{error}</div>}
   {notice&&<div role="status" style={{...panel,borderColor:"#167c53",color:"#9df2c1",marginBottom:16}}>{notice}</div>}
   <section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:18}}>
    {[["Total",rows.length],["Novos",count("new")],["Em análise",count("reviewing")],["Contatados",count("contacted")],["Propostas enviadas",count("proposal_sent")]].map(([label,value])=><article key={label} style={panel}><div style={muted}>{label}</div><strong style={{display:"block",fontSize:28,marginTop:8}}>{value}</strong></article>)}
   </section>
   {loading&&!rows.length?<section style={panel}>Carregando solicitações…</section>:!rows.length?<section style={panel}>Nenhuma solicitação encontrada. Se o formulário público já foi enviado, confira se este portal está usando o mesmo projeto Supabase e se as políticas de leitura permitem acesso administrativo.</section>:
    <section style={{display:"grid",gap:14}}>
     {rows.map(row=><article key={row.id} style={panel}>
      <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"flex-start",flexWrap:"wrap"}}>
       <div><h2 style={{margin:"0 0 6px",fontSize:19}}>{row.name||"Interessado sem nome"}</h2><div style={muted}>{row.company||"Pessoa física"} · {date(row.created_at)}</div></div>
       <span style={{background:"#122b3c",borderRadius:20,padding:"8px 12px",fontWeight:800}}>{statuses.find(s=>s[0]===row.status)?.[1]||row.status||"Sem status"}</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,240px),1fr))",gap:10,marginTop:14,fontSize:14}}>
       <div><b>E-mail:</b> {row.email||"—"}</div><div><b>WhatsApp:</b> {row.whatsapp||"—"}</div><div><b>Interesse:</b> {row.interest_type||"—"}</div><div><b>Consentimento:</b> {row.consent?"Confirmado":"Não confirmado"}</div>
      </div>
      {row.message&&<div style={{marginTop:12,padding:12,background:"#091824",borderRadius:10,whiteSpace:"pre-wrap",lineHeight:1.6}}>{row.message}</div>}
      <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginTop:14}}><label htmlFor={"status-"+row.id} style={muted}>Andamento da proposta</label><select id={"status-"+row.id} value={row.status||"new"} disabled={busy===row.id} onChange={e=>changeStatus(row.id,e.target.value)} style={{padding:"10px 12px",borderRadius:9,border:"1px solid rgba(99,202,255,.25)",background:"#091824",color:"#eaf6ff",fontWeight:700}}>{statuses.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select>{busy===row.id&&<span style={muted}>Salvando…</span>}</div>
     </article>)}
    </section>}
  </div>
 </div>
}