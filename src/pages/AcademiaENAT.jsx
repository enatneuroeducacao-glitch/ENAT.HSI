import React,{useCallback,useEffect,useMemo,useState} from "react";
import {supabase} from "../lib/supabaseClient";
import "./AcademiaENAT.css";

const getToken=()=>new URLSearchParams(window.location.search).get("convite")||"";
const money=value=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(value||0)/100);
const date=value=>value?new Date(value).toLocaleDateString("pt-BR"):"—";

export function AcademiaENAT(){
 const [session,setSession]=useState(null),[profile,setProfile]=useState(null),[enrollments,setEnrollments]=useState([]),[selected,setSelected]=useState(null),[modules,setModules]=useState([]),[lessons,setLessons]=useState([]),[progress,setProgress]=useState([]);
 const [mode,setMode]=useState(getToken()?"register":"login"),[name,setName]=useState(""),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState(""),[notice,setNotice]=useState("");
 const [activeLesson,setActiveLesson]=useState(null),[showPassword,setShowPassword]=useState(false),[paymentUrl,setPaymentUrl]=useState(""),[pendingCourseId,setPendingCourseId]=useState(new URLSearchParams(window.location.search).get("course_id")||""),[paymentResult,setPaymentResult]=useState(new URLSearchParams(window.location.search).get("payment")||"");
 const inviteToken=getToken();
 const hasClient=!!supabase;

 const loadStudent=useCallback(async(user)=>{
  if(!supabase||!user)return;
  const {error:profileError}=await supabase.from("ava_profiles").upsert({id:user.id,email:user.email,full_name:user.user_metadata?.full_name||user.user_metadata?.name||user.email,role:"student"},{onConflict:"id",ignoreDuplicates:true});
  if(profileError)throw profileError;
  const [{data:profileData,error:pError},{data:enrollmentData,error:eError}]=await Promise.all([
   supabase.from("ava_profiles").select("id,email,full_name,role,avatar_url").eq("id",user.id).maybeSingle(),
   supabase.from("ava_enrollments").select("id,course_id,status,enrolled_at,completed_at").eq("user_id",user.id).in("status",["active","completed"]).order("enrolled_at",{ascending:false})
  ]);
  if(pError)throw pError;if(eError)throw eError;
  setProfile(profileData);
  const ids=(enrollmentData||[]).map(x=>x.course_id);
  const {data:courseData,error:cError}=ids.length?await supabase.from("ava_courses").select("id,title,slug,description,workload_hours,cover_url,status,metadata").in("id",ids):{data:[],error:null};
  if(cError)throw cError;
  const mappedEnrollments=(enrollmentData||[]).map(en=>({...en,course:(courseData||[]).find(c=>c.id===en.course_id)||null}));
   setEnrollments(mappedEnrollments.filter(en=>en.course));
 },[]);

 const redeemInvite=useCallback(async()=>{
  if(!supabase||!inviteToken)return;
  const {data:{session:current}}=await supabase.auth.getSession();
  if(!current)return;
  const {data,error:invokeError}=await supabase.functions.invoke("ava-enrollment",{body:{action:"redeem_invite",token:inviteToken}});
  if(invokeError)throw invokeError;if(data?.error)throw new Error(data.error);
  if(data?.payment_required){setPendingCourseId(data.course.id);setPaymentUrl(data.checkout_url||"");setNotice("A matrícula está vinculada ao curso "+data.course.title+". Conclua o pagamento seguro para liberar o acesso.");await loadStudent(current.user);return;}
  setNotice("Matrícula confirmada: "+data.course.title+". Seu acesso está liberado.");
  setPaymentUrl("");setPendingCourseId("");
  const url=new URL(window.location.href);url.searchParams.delete("convite");window.history.replaceState({}, "",url.toString());
  await loadStudent(current.user);
 },[inviteToken,loadStudent]);

 useEffect(()=>{
  if(!supabase){setError("Conexão com a plataforma acadêmica indisponível.");setLoading(false);return}
  let alive=true;
  supabase.auth.getSession().then(async({data,error:sessionError})=>{
   if(!alive)return;if(sessionError)throw sessionError;
   if(data.session){setSession(data.session);await loadStudent(data.session.user);if(inviteToken)await redeemInvite()}
  }).catch(e=>{if(alive)setError(e.message||"Não foi possível validar sua sessão.")}).finally(()=>{if(alive)setLoading(false)});
  const {data}=supabase.auth.onAuthStateChange((_event,next)=>{setSession(next);if(next)setTimeout(()=>loadStudent(next.user).catch(e=>setError(e.message)),0);else{setProfile(null);setEnrollments([]);setSelected(null)}});
  return()=>{alive=false;data.subscription.unsubscribe()};
 },[loadStudent,redeemInvite,inviteToken]);

 const openCourse=async enrollment=>{
  setError("");setNotice("");setSelected(enrollment);setActiveLesson(null);setModules([]);setLessons([]);setProgress([]);
  const {data:mods,error:modError}=await supabase.from("ava_modules").select("id,title,description,sort_order").eq("course_id",enrollment.course_id).order("sort_order");
  if(modError){setError(modError.message);return}
  const moduleIds=(mods||[]).map(m=>m.id);setModules(mods||[]);
  if(!moduleIds.length)return;
  const {data:lessonData,error:lessonError}=await supabase.from("ava_lessons").select("id,module_id,title,slug,lesson_type,content,duration_minutes,sort_order").in("module_id",moduleIds).eq("status","published").order("sort_order");
  if(lessonError){setError(lessonError.message);return}
  setLessons(lessonData||[]);
  if(lessonData?.length){const {data:progressData}=await supabase.from("ava_progress").select("lesson_id,status,progress_percent,completed_at").eq("user_id",session.user.id).in("lesson_id",lessonData.map(x=>x.id));setProgress(progressData||[])}
 };
 const progressCount=useMemo(()=>progress.filter(x=>x.status==="completed").length,[progress]);
 const finishLesson=async lesson=>{
  if(!supabase||!session)return;setBusy(true);setError("");
  try{
   const now=new Date().toISOString();
   const {error:saveError}=await supabase.from("ava_progress").upsert({user_id:session.user.id,lesson_id:lesson.id,status:"completed",progress_percent:100,last_position_seconds:0,started_at:now,completed_at:now,updated_at:now},{onConflict:"user_id,lesson_id"});
   if(saveError)throw saveError;
   setProgress(old=>[...old.filter(x=>x.lesson_id!==lesson.id),{lesson_id:lesson.id,status:"completed",progress_percent:100,completed_at:now}]);
   setNotice("Aula marcada como concluída.");
  }catch(e){setError(e.message||"Não foi possível salvar seu progresso.")}finally{setBusy(false)}
 };
 const retryPayment=async()=>{if(!pendingCourseId)return;setBusy(true);setError("");try{const {data,error}=await supabase.functions.invoke("ava-enrollment",{body:{action:"create_payment_request",course_id:pendingCourseId}});if(error)throw error;if(data?.error)throw new Error(data.error);setPaymentUrl(data.checkout_url||"");setNotice("Novo link de pagamento gerado. A matrícula será liberada após a confirmação do Mercado Pago.")}catch(e){setError(e.message||"Não foi possível gerar o pagamento.")}finally{setBusy(false)}};
 const logout=async()=>{await supabase.auth.signOut();setSelected(null);setNotice("Você saiu da plataforma.")};

 const submitAuth=async e=>{
  e.preventDefault();setBusy(true);setError("");setNotice("");
  try{
   if(mode==="register"){
    if(!inviteToken)throw new Error("O cadastro é realizado somente por convite de matrícula vinculado a um curso.");
    const {data,error:signError}=await supabase.auth.signUp({email:email.trim().toLowerCase(),password,options:{data:{full_name:name.trim(),account_type:"ava_student"},emailRedirectTo:window.location.origin+"/academia?convite="+encodeURIComponent(inviteToken)}});
    if(signError)throw signError;
    if(data.session){setSession(data.session);await loadStudent(data.user);await redeemInvite()}
    else setNotice("Cadastro iniciado. Confirme seu e-mail pelo link enviado e depois entre nesta página para ativar o convite e acessar seu curso.");
   }else{
    const {data,error:signError}=await supabase.auth.signInWithPassword({email:email.trim().toLowerCase(),password});
    if(signError)throw new Error("E-mail ou senha inválidos.");
    setSession(data.session);await loadStudent(data.user);if(inviteToken)await redeemInvite();
   }
  }catch(e){setError(e.message||"Não foi possível concluir a operação.")}finally{setBusy(false)}
 };

 if(loading)return <main className="academy-shell"><div className="academy-loading">Preparando sua sala de aprendizagem…</div></main>;
 if(!session)return <main className="academy-shell"><div className="academy-auth-layout"><section className="academy-brand-panel"><span className="academy-kicker">AMBIENTE VIRTUAL DE APRENDIZAGEM</span><div className="academy-mark">ENAT<span>ACADEMIA</span></div><h1>Conhecimento que transforma a prática no trânsito.</h1><p>Um ambiente exclusivo para alunos matriculados, com aulas, materiais, avaliações e acompanhamento da sua evolução.</p><div className="academy-feature-list"><span>✓ Acesso individual e protegido</span><span>✓ Progresso acadêmico acompanhado</span><span>✓ Conteúdo por curso e matrícula</span><span>✓ Certificação após os requisitos de conclusão</span></div></section><section className="academy-auth-card"><div className="academy-auth-heading"><span className="academy-kicker">{mode==="register"?"ATIVAÇÃO DE MATRÍCULA":"ÁREA DO ALUNO"}</span><h2>{mode==="register"?"Crie seu acesso":"Bem-vindo de volta"}</h2><p>{mode==="register"?"Seu convite está vinculado a um curso específico. Use o mesmo e-mail para o qual foi enviado.":"Entre para continuar de onde parou nos cursos do ENAT."}</p></div>{inviteToken&&<div className="academy-invite-note">Convite de matrícula detectado. O acesso será liberado somente ao curso associado a este convite.</div>}{!inviteToken&&mode==="register"&&<div className="academy-invite-note">O cadastro não é aberto ao público. Solicite ao ENAT ou ao responsável pela turma um convite de matrícula para o curso correspondente.</div>}<form onSubmit={submitAuth} className="academy-auth-form">{mode==="register"&&<label>Nome completo<input value={name} onChange={e=>setName(e.target.value)} required autoComplete="name"/></label>}<label>E-mail<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email"/></label><label>Senha<div className="academy-password"><input type={showPassword?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} required minLength={8} autoComplete={mode==="register"?"new-password":"current-password"}/><button type="button" onClick={()=>setShowPassword(x=>!x)}>{showPassword?"Ocultar":"Mostrar"}</button></div><small>Mínimo de 8 caracteres.</small></label>{error&&<div className="academy-error">{error}</div>}{notice&&<div className="academy-notice">{notice}</div>}<button className="academy-primary" disabled={busy||!hasClient}>{busy?"Aguarde…":mode==="register"?"Criar acesso e ativar matrícula":"Entrar na minha sala"}</button></form><div className="academy-auth-switch">{mode==="login"?(inviteToken?<button onClick={()=>setMode("register")}>Primeiro acesso? Criar conta com convite</button>:<span>Primeiro acesso? Peça um convite de matrícula ao ENAT.</span>):<button onClick={()=>setMode("login")}>Já tenho conta. Fazer login</button>}</div><a className="academy-back" href="/portal">← Voltar ao portal ENAT</a></section></div></main>;

 return <main className="academy-shell"><header className="academy-topbar"><a className="academy-wordmark" href="/portal">ENAT <span>ACADEMIA</span></a><div className="academy-user"><span>{profile?.full_name||session.user.email}</span><button onClick={logout}>Sair</button></div></header><div className="academy-dashboard"><div className="academy-welcome"><div><span className="academy-kicker">AMBIENTE DO ALUNO</span><h1>Olá, {(profile?.full_name||session.user.email||"aluno").split(" ")[0]}.</h1><p>Acompanhe suas matrículas e continue sua formação.</p></div><div className="academy-user-badge">ENAT · ÁREA RESTRITA</div></div>{error&&<div className="academy-error">{error}</div>}{notice&&<div className="academy-notice">{notice}</div>}{!enrollments.length?<section className="academy-empty"><div>🔐</div><h2>{paymentUrl?"Conclua o pagamento para liberar seu curso":paymentResult==="success"?"Pagamento recebido — confirmando matrícula":paymentResult==="pending"?"Pagamento em processamento":paymentResult==="failure"?"Pagamento não concluído":"Nenhuma matrícula ativa encontrada"}</h2><p>{paymentUrl?"Seu convite está associado a um curso específico. O acesso será liberado automaticamente depois que o Mercado Pago confirmar o pagamento.":paymentResult==="success"?"O Mercado Pago retornou a confirmação. Estamos aguardando a notificação segura para ativar sua matrícula; atualize esta tela em instantes.":paymentResult==="pending"?"Assim que o provedor confirmar o pagamento, o curso aparecerá nesta área.":paymentResult==="failure"?"Você pode solicitar um novo link de pagamento ao ENAT.": "Sua conta está autenticada, mas ainda não possui matrícula liberada. O acesso aos cursos é individual e depende de convite e autorização do ENAT."}</p>{paymentUrl&&<a className="academy-primary academy-payment-link" href={paymentUrl}>Ir para pagamento seguro →</a>}{pendingCourseId&&paymentResult==="failure"&&<button className="academy-payment-retry" onClick={retryPayment} disabled={busy}>{busy?"Gerando…":"Tentar pagamento novamente"}</button>}<button className="academy-payment-retry" onClick={()=>loadStudent(session.user)}>↻ Atualizar minhas matrículas</button><a href="/portal">Voltar ao portal ENAT</a></section>:!selected?<><div className="academy-section-title"><h2>Meus cursos</h2><span>{enrollments.length} matrícula(s) liberada(s)</span></div><div className="academy-course-grid">{enrollments.map(en=>{const pct=0;return <article className="academy-course-card" key={en.id}><div className="academy-course-cover"><span>ENAT</span><small>{en.course.workload_hours||0} HORAS</small></div><div className="academy-course-body"><span className="academy-course-status">{en.status==="completed"?"CONCLUÍDO":"MATRÍCULA ATIVA"}</span><h3>{en.course.title}</h3><p>{en.course.description||"Formação profissional ENAT."}</p><div className="academy-progress"><span style={{width:pct+"%"}}/></div><small>Início da matrícula: {date(en.enrolled_at)}</small><button className="academy-primary" onClick={()=>openCourse(en)}>Acessar curso →</button></div></article>})}</div></>:<section className="academy-learning"><button className="academy-back-button" onClick={()=>setSelected(null)}>← Meus cursos</button><div className="academy-learning-heading"><span className="academy-kicker">SALA DE APRENDIZAGEM</span><h1>{selected.course.title}</h1><p>{selected.course.description}</p></div><div className="academy-learning-layout"><aside className="academy-curriculum"><h3>Conteúdo do curso</h3>{modules.map(mod=><section key={mod.id} className="academy-module"><strong>{mod.title}</strong>{lessons.filter(l=>l.module_id===mod.id).map(lesson=><button key={lesson.id} className={activeLesson?.id===lesson.id?"active":""} onClick={()=>setActiveLesson(lesson)}>{progress.some(p=>p.lesson_id===lesson.id&&p.status==="completed")?"✓ ":""}{lesson.title}</button>)}</section>)}{!lessons.length&&<p className="academy-muted">O conteúdo das aulas está em preparação. Sua matrícula já está vinculada a este curso; novas aulas serão liberadas pela equipe ENAT.</p>}</aside><article className="academy-lesson-view">{activeLesson?<><span className="academy-kicker">AULA · {activeLesson.duration_minutes||0} MIN</span><h2>{activeLesson.title}</h2><div className="academy-lesson-content">{activeLesson.content||"O material desta aula está em preparação e será disponibilizado pelo docente."}</div>{!progress.some(p=>p.lesson_id===activeLesson.id&&p.status==="completed")&&<button className="academy-primary" disabled={busy||!activeLesson.content} onClick={()=>finishLesson(activeLesson)}>{busy?"Salvando…":"Marcar aula como concluída"}</button>}</>:<div className="academy-lesson-placeholder"><div>📘</div><h2>Continue sua aprendizagem</h2><p>Selecione uma aula no currículo para abrir o conteúdo.</p><small>{lessons.length?progressCount+" de "+lessons.length+" aulas concluídas":"As aulas serão liberadas pela equipe ENAT."}</small></div>}</article></div></section>}</div></main>;
}
