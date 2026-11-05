import React,{useCallback,useEffect,useState} from "react";
import {supabase} from "../lib/supabaseClient";
import "./AcademiaAdminENAT.css";
const money=v=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(v||0)/100);
const date=v=>v?new Date(v).toLocaleString("pt-BR"):"—";
export function AcademiaAdminENAT(){
 const [courses,setCourses]=useState([]),[invites,setInvites]=useState([]),[enrollments,setEnrollments]=useState([]),[payments,setPayments]=useState([]);
 const [email,setEmail]=useState(""),[courseId,setCourseId]=useState(""),[waived,setWaived]=useState(false),[inviteUrl,setInviteUrl]=useState(""),[busy,setBusy]=useState(false),[msg,setMsg]=useState(""),[error,setError]=useState("");
 const load=useCallback(async()=>{
  if(!supabase)return;
  setBusy(true);setError("");
  try{
   const [c,i,e,p]=await Promise.all([
    supabase.from("ava_courses").select("id,title,slug,status,workload_hours,price_cents,payment_required,enrollment_mode").order("title"),
    supabase.from("ava_enrollment_invites").select("id,email,course_id,status,expires_at,payment_waived,created_at").order("created_at",{ascending:false}).limit(100),
    supabase.from("ava_enrollments").select("id,user_id,course_id,status,enrolled_at,access_source").order("enrolled_at",{ascending:false}).limit(200),
    supabase.from("ava_payments").select("id,user_id,course_id,payment_method,status,amount_cents,currency,created_at").order("created_at",{ascending:false}).limit(100)
   ]);
   for(const x of [c,i,e,p])if(x.error)throw x.error;
   setCourses(c.data||[]);setInvites(i.data||[]);setEnrollments(e.data||[]);setPayments(p.data||[]);
   if(!courseId&&c.data?.length)setCourseId(c.data[0].id);
  }catch(e){setError(e.message||"Falha ao carregar gestão acadêmica.")}finally{setBusy(false)}
 },[courseId]);
 useEffect(()=>{load()},[load]);
 const createInvite=async e=>{
  e.preventDefault();setBusy(true);setError("");setMsg("");setInviteUrl("");
  try{
   const {data,error}=await supabase.functions.invoke("ava-enrollment",{body:{action:"create_invite",email:email.trim(),course_id:courseId,payment_waived:waived,public_base:window.location.origin}});
   if(error)throw error;if(data?.error)throw new Error(data.error);
   setInviteUrl(data.invite_url);setMsg("Convite criado e vinculado exclusivamente ao curso selecionado.");setEmail("");await load();
  }catch(e){setError(e.message||"Não foi possível criar o convite.")}finally{setBusy(false)}
 };
 const savePricing=async course=>{
  const raw=window.prompt("Informe o preço em reais. Deixe vazio para não configurar cobrança.",course.price_cents==null?"":(Number(course.price_cents)/100).toFixed(2));
  if(raw===null)return;
  const normalized=raw.trim().replace(",",".");
  const amount=normalized===""?null:Math.round(Number(normalized)*100);
  if(amount!==null&&(!Number.isFinite(amount)||amount<0)){setError("Informe um valor válido.");return}
  setBusy(true);setError("");
  try{const {error}=await supabase.from("ava_courses").update({price_cents:amount}).eq("id",course.id);if(error)throw error;setMsg("Configuração de preço atualizada. Preço salvo. Ative o checkout somente após validar o valor, as regras de parcelamento e a conta recebedora do Mercado Pago.");await load()}catch(e){setError(e.message)}finally{setBusy(false)}
 };
 const togglePayment=async(course,enabled)=>{if(enabled&&(!course.price_cents||Number(course.price_cents)<=0)){setError("Defina o preço do curso antes de ativar a cobrança.");return}if(enabled&&!window.confirm("Ativar o Checkout Pro do Mercado Pago para este curso? O pagamento confirmado liberará automaticamente apenas esta matrícula."))return;setBusy(true);setError("");try{const {error}=await supabase.from("ava_courses").update({payment_required:enabled}).eq("id",course.id);if(error)throw error;setMsg(enabled?"Checkout Mercado Pago ativado para este curso.":"Cobrança desativada para este curso.");await load()}catch(e){setError(e.message)}finally{setBusy(false)}};
 const approve=async payment=>{
  if(!window.confirm("Confirma que o recebimento deste pagamento foi verificado fora da plataforma?"))return;
  setBusy(true);setError("");
  try{const {data,error}=await supabase.functions.invoke("ava-enrollment",{body:{action:"approve_manual_payment",payment_id:payment.id}});if(error)throw error;if(data?.error)throw new Error(data.error);setMsg("Pagamento confirmado e matrícula liberada.");await load()}catch(e){setError(e.message)}finally{setBusy(false)}
 };
 const copy=async()=>{try{await navigator.clipboard.writeText(inviteUrl);setMsg("Link do convite copiado.")}catch{setError("Não foi possível copiar automaticamente. Selecione e copie o link.")}};
 const courseName=id=>courses.find(c=>c.id===id)?.title||"Curso";
 return <main className="academy-admin"><header className="academy-admin-head"><div><span>ENAT ACADEMIA · ADMINISTRAÇÃO</span><h1>Gestão da plataforma de cursos</h1><p>Controle de turmas, convites, matrículas e configuração comercial.</p></div><button onClick={load} disabled={busy}>↻ Atualizar</button></header>
 {error&&<div className="academy-admin-error">{error}</div>}{msg&&<div className="academy-admin-notice">{msg}</div>}
 <section className="academy-admin-metrics"><article><small>CURSOS ATIVOS</small><strong>{courses.filter(x=>x.status==="published").length}</strong></article><article><small>MATRÍCULAS</small><strong>{enrollments.filter(x=>["active","completed"].includes(x.status)).length}</strong></article><article><small>CONVITES PENDENTES</small><strong>{invites.filter(x=>x.status==="pending").length}</strong></article><article><small>PAGAMENTOS PENDENTES</small><strong>{payments.filter(x=>x.status==="pending").length}</strong></article></section>
 <section className="academy-admin-panel"><div className="academy-admin-panel-title"><div><span>01 · MATRÍCULA CONTROLADA</span><h2>Emitir convite de acesso</h2><p>O convite é individual, enviado a um e-mail e vinculado a um único curso. Não concede acesso ao restante do catálogo.</p></div></div>
 <form className="academy-admin-invite-form" onSubmit={createInvite}><label>E-mail do aluno<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="aluno@exemplo.com"/></label><label>Curso autorizado<select value={courseId} onChange={e=>setCourseId(e.target.value)} required>{courses.filter(c=>c.status==="published").map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select></label><label className="academy-admin-check"><input type="checkbox" checked={waived} onChange={e=>setWaived(e.target.checked)}/> Isentar pagamento para esta matrícula</label><button disabled={busy||!courseId}>{busy?"Processando…":"Gerar convite de matrícula"}</button></form>
 {inviteUrl&&<div className="academy-admin-generated"><strong>Convite criado</strong><input readOnly value={inviteUrl}/><button onClick={copy}>Copiar link</button><small>O link expira em 7 dias e só pode ser resgatado pelo e-mail informado.</small></div>}</section>
 <section className="academy-admin-panel"><div className="academy-admin-panel-title"><div><span>02 · CONFIGURAÇÃO COMERCIAL</span><h2>Preços e cobrança</h2><p>Os valores ainda não foram definidos. Configure o preço após a decisão comercial do ENAT; o checkout depende da configuração e homologação da conta Mercado Pago.</p></div></div><div className="academy-admin-course-list">{courses.map(c=><article key={c.id}><div><strong>{c.title}</strong><small>{c.workload_hours||0} horas · {c.enrollment_mode==="invite_only"?"Acesso por convite":"Acesso configurável"}</small></div><div className="academy-admin-course-price"><b>{c.price_cents==null?"Preço não definido":money(c.price_cents)}</b><small>{c.payment_required?"Checkout Mercado Pago ativo":"Checkout desativado"}</small><label className="academy-admin-toggle"><input type="checkbox" checked={!!c.payment_required} disabled={busy||(!c.payment_required&&!c.price_cents)} onChange={e=>togglePayment(c,e.target.checked)}/> Ativar cobrança</label></div><button onClick={()=>savePricing(c)} disabled={busy}>Configurar preço</button></article>)}</div><div className="academy-admin-payment-note"><strong>Recomendação para o lançamento:</strong> Mercado Pago Checkout Pro, com Pix, cartões e boleto conforme disponibilidade da conta. O aluno paga no ambiente seguro do Mercado Pago; o webhook assinado valida a transação e libera somente o curso comprado. Convites gratuitos/patrocinados continuam disponíveis para turmas autorizadas.</div></section>
 <section className="academy-admin-panel"><div className="academy-admin-panel-title"><div><span>03 · MATRÍCULAS</span><h2>Alunos e cursos autorizados</h2></div></div><div className="academy-admin-table-wrap"><table><thead><tr><th>Usuário</th><th>Curso</th><th>Situação</th><th>Origem</th><th>Data</th></tr></thead><tbody>{enrollments.map(x=><tr key={x.id}><td>{x.user_id.slice(0,8)}…</td><td>{courseName(x.course_id)}</td><td>{x.status}</td><td>{x.access_source||"—"}</td><td>{date(x.enrolled_at)}</td></tr>)}{!enrollments.length&&<tr><td colSpan="5">Nenhuma matrícula registrada.</td></tr>}</tbody></table></div></section>
 <section className="academy-admin-panel"><div className="academy-admin-panel-title"><div><span>04 · CONVITES E FINANCEIRO</span><h2>Histórico de convites e pagamentos</h2></div></div><div className="academy-admin-table-wrap"><table><thead><tr><th>E-mail</th><th>Curso</th><th>Convite</th><th>Expira</th><th>Pagamento isento</th></tr></thead><tbody>{invites.map(x=><tr key={x.id}><td>{x.email}</td><td>{courseName(x.course_id)}</td><td>{x.status}</td><td>{date(x.expires_at)}</td><td>{x.payment_waived?"Sim":"Não"}</td></tr>)}{!invites.length&&<tr><td colSpan="5">Nenhum convite criado.</td></tr>}</tbody></table></div><div className="academy-admin-table-wrap"><table><thead><tr><th>Pagamento</th><th>Curso</th><th>Forma</th><th>Valor</th><th>Status</th><th>Ação</th></tr></thead><tbody>{payments.map(x=><tr key={x.id}><td>{x.id.slice(0,8)}…</td><td>{courseName(x.course_id)}</td><td>{x.payment_method==="checkout_pro"?"Mercado Pago Checkout Pro":x.payment_method}</td><td>{money(x.amount_cents)}</td><td>{x.status}</td><td>{x.status==="pending"&&x.payment_method==="manual"?<button onClick={()=>approve(x)} disabled={busy}>Confirmar recebimento</button>:x.status==="pending"?"Aguardando webhook":"—"}</td></tr>)}{!payments.length&&<tr><td colSpan="6">Nenhum pagamento registrado.</td></tr>}</tbody></table></div></section>
 </main>;
}
