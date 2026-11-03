import React,{useCallback,useEffect,useState}from"react";
import{supabase}from"../lib/supabaseClient";

const panel={background:"#0c1b29",border:"1px solid rgba(99,202,255,.18)",borderRadius:16,padding:20,minWidth:0};
const muted={color:"#8fa8ba",fontSize:13};
const btn={border:"1px solid rgba(99,202,255,.25)",background:"#0e2535",color:"#dff5ff",borderRadius:10,padding:"10px 14px",cursor:"pointer",fontWeight:800};
const field={boxSizing:"border-box",width:"100%",minWidth:0,padding:"10px 12px",borderRadius:9,border:"1px solid rgba(99,202,255,.25)",background:"#071522",color:"#eaf6ff",font:"inherit"};
const date=v=>v?new Date(v).toLocaleString("pt-BR"):"—";
const statuses=[["new","Novo"],["reviewing","Em análise"],["contacted","Contatado"],["proposal_sent","Proposta enviada"],["closed","Encerrado"]];
const partnershipTypes=["Patrocínio de Live","Apoio institucional","Parceria educacional","Parceria científica","Divulgação e mídia","Apoio a evento","Outra modalidade"];
const initialValues={"Patrocínio de Live":1500,"Apoio institucional":0,"Parceria educacional":0,"Parceria científica":0,"Divulgação e mídia":0,"Apoio a evento":0,"Outra modalidade":0};
const money=v=>Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const missingColumns=e=>/column .* does not exist|schema cache/i.test(e?.message||"");

export function ParceriasAdmin(){
 const[rows,setRows]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(""),[notice,setNotice]=useState(""),[busy,setBusy]=useState("");
 const[priceTable,setPriceTable]=useState(initialValues),[priceBusy,setPriceBusy]=useState(false);
 const[proposalDrafts,setProposalDrafts]=useState({});
 const load=useCallback(async()=>{
  if(!supabase){setError("Supabase da Central ENAT HSI não está configurado.");setLoading(false);return}
  setLoading(true);setError("");
  try{
   const r=await supabase.from("cmnt_sponsorship_leads").select("*").order("created_at",{ascending:false}).limit(500);
   if(r.error)throw r.error;
   const data=r.data||[];setRows(data);
   const drafts={};data.forEach(x=>{drafts[x.id]={amount:x.proposed_amount??initialValues[x.interest_type]??0,conditions:x.proposal_conditions||"",validUntil:x.proposal_valid_until||"",subject:x.proposal_subject||("Proposta de parceria ENAT — "+(x.interest_type||"Neurotrânsito"))}});
   setProposalDrafts(drafts);
  }catch(e){setError("Não foi possível consultar as solicitações: "+(e?.message||"erro desconhecido"))}
  finally{setLoading(false)}
 },[]);
 useEffect(()=>{load()},[load]);
 const updateDraft=(id,key,value)=>setProposalDrafts(old=>({...old,[id]:{...(old[id]||{}),[key]:value}}));
 const persistProposal=async(row,extra={})=>{
  const d=proposalDrafts[row.id]||{};
  const patch={proposed_amount:Number(d.amount||0),proposal_conditions:d.conditions||"",proposal_valid_until:d.validUntil||null,proposal_subject:d.subject||"" ,...extra};
  const r=await supabase.from("cmnt_sponsorship_leads").update(patch).eq("id",row.id).select("*").single();
  if(r.error)throw r.error;
  setRows(old=>old.map(x=>x.id===row.id?{...x,...r.data}:x));
  return {...row,...r.data};
 };
 const changeStatus=async(id,status)=>{
  setBusy(id);setError("");setNotice("");
  try{const r=await supabase.from("cmnt_sponsorship_leads").update({status}).eq("id",id).select("id,status").single();if(r.error)throw r.error;setRows(old=>old.map(x=>x.id===id?{...x,status:r.data.status}:x));setNotice("Status atualizado e salvo no banco de dados.")}
  catch(e){setError("Não foi possível atualizar o status: "+(e?.message||"verifique as permissões da tabela."))}
  finally{setBusy("")}
 };
 const saveProposal=async row=>{
  setBusy(row.id);setError("");setNotice("");
  try{await persistProposal(row);setNotice("Valores e condições da proposta salvos.");}
  catch(e){setError(missingColumns(e)?"A tabela ainda não possui os campos da proposta. Execute o script SQL de migração partnership-proposal-fields.sql no Supabase e tente novamente.":"Não foi possível salvar a proposta: "+(e?.message||"verifique as permissões da tabela."))}
  finally{setBusy("")}
 };
 const prepareEmail=async row=>{
  setBusy(row.id);setError("");setNotice("");
  try{
   const saved=await persistProposal(row);
   const d=proposalDrafts[row.id]||{};
   const subject=d.subject||"Proposta de parceria ENAT";
   const body="Olá "+(saved.name||"")+"!\n\nAgradecemos seu interesse em estabelecer uma parceria com o ENAT / Neurotrânsito.\n\nModalidade: "+(saved.interest_type||"Parceria") +"\nValor proposto: "+money(d.amount)+"\nValidade da proposta: "+(d.validUntil?new Date(d.validUntil+"T12:00:00").toLocaleDateString("pt-BR"):"A combinar")+"\n\nCondições e detalhes:\n"+(d.conditions||"A definir em conjunto.")+"\n\nFicamos à disposição para esclarecer dúvidas e alinhar os próximos passos.\n\nAtenciosamente,\nENAT — Ensino Neuroeducacional Aplicado ao Trânsito";
   if(!saved.email)throw new Error("Esta solicitação não possui e-mail cadastrado.");
   window.location.href="mailto:"+encodeURIComponent(saved.email)+"?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body);
   setNotice("Proposta salva e rascunho de e-mail preparado. Confira e envie no seu aplicativo de e-mail; o sistema não confirma o envio automaticamente.");
  }catch(e){setError(missingColumns(e)?"Execute primeiro o script partnership-proposal-fields.sql no Supabase para habilitar o salvamento da proposta.":"Não foi possível preparar a proposta: "+(e?.message||"erro desconhecido"))}
  finally{setBusy("")}
 };
 const markSent=async row=>{
  setBusy(row.id);setError("");setNotice("");
  try{await persistProposal(row,{status:"proposal_sent",proposal_sent_at:new Date().toISOString()});setNotice("Proposta marcada como enviada e registrada no sistema. Use esta opção somente depois de enviar o e-mail.");}
  catch(e){setError(missingColumns(e)?"Execute primeiro o script partnership-proposal-fields.sql no Supabase para habilitar o registro do envio.":"Não foi possível registrar o envio: "+(e?.message||"erro desconhecido"))}
  finally{setBusy("")}
 };
 const savePriceTable=()=>{setPriceBusy(false);setNotice("Tabela de valores editável nesta sessão. Para persistir os valores padrão no banco, é necessária a configuração de uma tabela de preços no Supabase.");};
 const count=s=>rows.filter(r=>r.status===s).length;
 return <div style={{boxSizing:"border-box",width:"100%",minWidth:0,minHeight:"100%",color:"#eaf6ff",padding:0,fontFamily:"Arial,sans-serif"}}>
  <div style={{width:"100%",maxWidth:1500,margin:"0 auto",padding:"clamp(12px,2vw,28px)",boxSizing:"border-box"}}>
   <div style={{...muted,letterSpacing:".12em"}}>PORTAL ADMINISTRATIVO · ENAT HSI</div>
   <h1 style={{margin:"8px 0",fontSize:"clamp(24px,2.2vw,34px)",lineHeight:1.2}}>Gestão de parcerias</h1>
   <p style={{...muted,fontSize:15,lineHeight:1.6,maxWidth:900}}>Gerencie solicitações, configure valores de referência e prepare propostas individualizadas para os interessados.</p>
   <div style={{display:"flex",gap:8,flexWrap:"wrap",margin:"18px 0"}}>
    <button style={btn} onClick={load} disabled={loading}>{loading?"Atualizando…":"↻ Atualizar solicitações"}</button>
    <a href="https://neurotransito.hsi-doth-pg.com.br" target="_blank" rel="noreferrer" style={{...btn,textDecoration:"none"}}>Abrir Neurotrânsito ↗</a>
   </div>
   {error&&<div role="alert" style={{...panel,borderColor:"#a52a2a",color:"#ffb8b8",marginBottom:16}}>{error}</div>}
   {notice&&<div role="status" style={{...panel,borderColor:"#167c53",color:"#9df2c1",marginBottom:16}}>{notice}</div>}
   <section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,150px),1fr))",gap:12,marginBottom:22}}>
    {[["Total",rows.length],["Novos",count("new")],["Em análise",count("reviewing")],["Contatados",count("contacted")],["Propostas enviadas",count("proposal_sent")]].map(([label,value])=><article key={label} style={panel}><div style={muted}>{label}</div><strong style={{display:"block",fontSize:28,marginTop:8}}>{value}</strong></article>)}
   </section>
   <section style={{...panel,marginBottom:22}}>
    <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",flexWrap:"wrap"}}><div><h2 style={{margin:"0 0 6px",fontSize:20}}>Tabela de valores de referência</h2><div style={muted}>Valores iniciais editáveis por modalidade. Ajuste antes de salvar a proposta individual.</div></div></div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,250px),1fr))",gap:12,marginTop:16}}>
     {partnershipTypes.map(type=><label key={type} style={{display:"grid",gap:7,fontSize:13,color:"#b8d1e2"}}>{type}<div style={{display:"flex",alignItems:"center",gap:8}}><span>R$</span><input style={field} type="number" min="0" step="0.01" value={priceTable[type]??0} onChange={e=>setPriceTable(old=>({...old,[type]:e.target.value}))}/></div></label>)}
    </div>
    <div style={{display:"flex",justifyContent:"flex-end",marginTop:14}}><button style={btn} onClick={savePriceTable}>Aplicar valores nesta sessão</button></div>
   </section>
   <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:12}}><h2 style={{margin:0,fontSize:22}}>Solicitações recebidas</h2><span style={muted}>{rows.length} registro(s)</span></div>
   {loading&&!rows.length?<section style={panel}>Carregando solicitações…</section>:!rows.length?<section style={panel}>Nenhuma solicitação encontrada. Confira a conexão e as políticas de leitura do Supabase.</section>:
    <section style={{display:"grid",gap:16}}>
     {rows.map(row=>{const d=proposalDrafts[row.id]||{amount:0,conditions:"",validUntil:"",subject:""};return <article key={row.id} style={{...panel,padding:"clamp(14px,2vw,24px)"}}>
      <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"flex-start",flexWrap:"wrap"}}>
       <div><h3 style={{margin:"0 0 6px",fontSize:20}}>{row.name||"Interessado sem nome"}</h3><div style={muted}>{row.company||"Pessoa física"} · Recebido em {date(row.created_at)}</div></div>
       <span style={{background:"#122b3c",borderRadius:20,padding:"8px 12px",fontWeight:800}}>{statuses.find(s=>s[0]===row.status)?.[1]||row.status||"Sem status"}</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,220px),1fr))",gap:12,marginTop:16,fontSize:14}}>
       <div><b>E-mail:</b> {row.email||"—"}</div><div><b>WhatsApp:</b> {row.whatsapp||"—"}</div><div><b>Interesse:</b> {row.interest_type||"—"}</div><div><b>Consentimento:</b> {row.consent?"Confirmado":"Não confirmado"}</div>
      </div>
      {row.message&&<div style={{marginTop:12,padding:14,background:"#091824",borderRadius:10,whiteSpace:"pre-wrap",lineHeight:1.6}}><b style={{display:"block",marginBottom:6}}>Mensagem do solicitante</b>{row.message}</div>}
      <div style={{borderTop:"1px solid rgba(99,202,255,.16)",marginTop:20,paddingTop:18}}>
       <h4 style={{margin:"0 0 14px",fontSize:17}}>Proposta comercial</h4>
       <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,220px),1fr))",gap:12}}>
        <label style={{display:"grid",gap:7,...muted}}>Tipo de parceria<select style={field} value={row.interest_type||""} disabled><option>{row.interest_type||"Não informado"}</option></select></label>
        <label style={{display:"grid",gap:7,...muted}}>Valor proposto (R$)<input style={field} type="number" min="0" step="0.01" value={d.amount??0} onChange={e=>updateDraft(row.id,"amount",e.target.value)}/></label>
        <label style={{display:"grid",gap:7,...muted}}>Validade da proposta<input style={field} type="date" value={d.validUntil||""} onChange={e=>updateDraft(row.id,"validUntil",e.target.value)}/></label>
        <label style={{display:"grid",gap:7,...muted}}>Assunto do e-mail<input style={field} value={d.subject||""} onChange={e=>updateDraft(row.id,"subject",e.target.value)}/></label>
       </div>
       <label style={{display:"grid",gap:7,...muted,marginTop:12}}>Condições, escopo e observações<textarea style={{...field,minHeight:110,resize:"vertical"}} value={d.conditions||""} onChange={e=>updateDraft(row.id,"conditions",e.target.value)} placeholder="Descreva entregas, contrapartidas, condições de pagamento e observações."/></label>
       <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap",marginTop:14}}>
        <div style={muted}>Valor atual: <b style={{color:"#eaf6ff"}}>{money(d.amount)}</b>{row.proposal_sent_at&&<span> · Enviada em {date(row.proposal_sent_at)}</span>}</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
         <button style={btn} disabled={busy===row.id} onClick={()=>saveProposal(row)}>{busy===row.id?"Salvando…":"Salvar proposta"}</button>
         <button style={btn} disabled={busy===row.id} onClick={()=>prepareEmail(row)}>Preparar e-mail</button>
         <button style={{...btn,borderColor:"rgba(36,190,126,.5)",background:"#10382e"}} disabled={busy===row.id} onClick={()=>markSent(row)}>Registrar como enviada</button>
        </div>
       </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginTop:18,borderTop:"1px solid rgba(99,202,255,.12)",paddingTop:14}}><label htmlFor={"status-"+row.id} style={muted}>Andamento</label><select id={"status-"+row.id} value={row.status||"new"} disabled={busy===row.id} onChange={e=>changeStatus(row.id,e.target.value)} style={{...field,width:"auto",maxWidth:"100%"}}>{statuses.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select>{busy===row.id&&<span style={muted}>Salvando…</span>}</div>
     </article>})}
    </section>}
  </div>
 </div>
}
