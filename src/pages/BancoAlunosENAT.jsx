import React,{useEffect,useMemo,useState} from "react";
import {createStudent,deleteStudent,listCourses,listStudents,updateStudent} from "../lib/certificatesApi";
import "./BancoAlunosENAT.css";

const empty={name:"",cpf:"",credential:"",uf:"",course_id:"",status:"em_espera"};
const statusLabel={em_espera:"Em espera",concluindo:"Concluindo",concluiu:"Concluiu"};
const formatCpf=v=>{const d=String(v||"").replace(/\D/g,"").slice(0,11);return d.replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d{1,2})$/,"$1-$2")};

export function BancoAlunosENAT(){
 const [students,setStudents]=useState([]),[courses,setCourses]=useState([]),[editing,setEditing]=useState(null),[query,setQuery]=useState(""),[busy,setBusy]=useState(false),[msg,setMsg]=useState("");
 const load=async()=>{
  setMsg("");
  const [studentsResult,coursesResult]=await Promise.allSettled([listStudents(),listCourses()]);
  const errors=[];
  if(studentsResult.status==="fulfilled"){
   setStudents(studentsResult.value?.students||[]);
  }else{
   errors.push(`Alunos: ${studentsResult.reason?.message||"não foi possível carregar o banco de alunos."}`);
  }
  if(coursesResult.status==="fulfilled"){
   const available=(coursesResult.value?.courses||[]).filter(x=>x.active!==false);
   setCourses(available);
   if(!available.length) errors.push("Nenhum curso ativo foi encontrado no Banco de Cursos.");
  }else{
   errors.push(`Cursos: ${coursesResult.reason?.message||"não foi possível carregar os cursos cadastrados."}`);
  }
  if(errors.length) setMsg(errors.join(" • "));
 };
 useEffect(()=>{load()},[]);
 const filtered=useMemo(()=>students.filter(s=>{const q=query.trim().toLowerCase();if(!q)return true;return [s.name,s.cpf,s.credential,s.uf,s.enat_courses?.name].some(v=>String(v||"").toLowerCase().includes(q));}),[students,query]);
 const begin=s=>setEditing(JSON.parse(JSON.stringify(s||empty)));
 const save=async()=>{if(!editing)return;setBusy(true);setMsg("");try{const p={name:editing.name,cpf:editing.cpf,credential:editing.credential,uf:editing.uf,course_id:editing.course_id,status:editing.status};if(editing.id){await updateStudent(editing.id,p);setMsg("Aluno atualizado e salvo no banco.")}else{await createStudent(p);setMsg("Aluno cadastrado e salvo no banco.")}setEditing(null);await load()}catch(e){setMsg(e.message)}finally{setBusy(false)}};
 const remove=async id=>{if(!confirm("Arquivar este aluno? O registro não será apagado."))return;setBusy(true);try{await deleteStudent(id);setMsg("Aluno arquivado.");await load()}catch(e){setMsg(e.message)}finally{setBusy(false)}};
 return <div className="students-admin"><header className="students-header"><div><div className="eyebrow">CENTRAL ENAT HSI · ADMINISTRAÇÃO</div><h1>Banco de Alunos</h1><p>Cadastre, acompanhe e atualize a situação dos alunos vinculados aos cursos ENAT.</p></div>{!editing&&<button className="primary" onClick={()=>begin(null)}>＋ Novo aluno</button>}</header>
 {msg&&<div className="notice">{msg}</div>}
 {!editing?<><div className="student-toolbar"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar por nome, CPF, credencial, UF ou curso..."/><span>{filtered.length} aluno(s)</span></div><section className="student-list"><div className="student-table"><div className="student-row student-head"><span>Aluno</span><span>CPF</span><span>Credencial / UF</span><span>Curso</span><span>Situação</span><span>Ações</span></div>{filtered.map(s=><div className="student-row" key={s.id}><div><strong>{s.name}</strong></div><div>{formatCpf(s.cpf)}</div><div>{s.credential||"—"}{s.uf?` / ${s.uf}`:""}</div><div>{s.enat_courses?.name||"Curso não localizado"}</div><div><span className={`student-status ${s.status}`}>{statusLabel[s.status]||s.status}</span></div><div className="row-actions"><button onClick={()=>begin(s)}>Editar</button>{s.active!==false&&<button className="danger" onClick={()=>remove(s.id)}>Arquivar</button>}</div></div>)}{!filtered.length&&<div className="empty">Nenhum aluno encontrado.</div>}</div></section></>:<section className="student-editor"><div className="editor-head"><div><div className="eyebrow">{editing.id?"EDIÇÃO DE ALUNO":"NOVO ALUNO"}</div><h2>{editing.id?editing.name||"Editar aluno":"Cadastrar aluno"}</h2></div><div className="row-actions"><button onClick={()=>setEditing(null)}>Cancelar</button><button className="primary" disabled={busy} onClick={save}>{busy?"Salvando…":"Salvar aluno"}</button></div></div><div className="student-form"><label>Nome completo<input autoComplete="name" value={editing.name||""} onChange={e=>setEditing(x=>({...x,name:e.target.value}))}/></label><label>CPF<input inputMode="numeric" autoComplete="off" value={formatCpf(editing.cpf)} onChange={e=>setEditing(x=>({...x,cpf:e.target.value}))}/></label><label>Credencial / UF (opcional)<div className="credential-row"><input placeholder="Número da credencial" value={editing.credential||""} onChange={e=>setEditing(x=>({...x,credential:e.target.value}))}/><select value={editing.uf||""} onChange={e=>setEditing(x=>({...x,uf:e.target.value}))}><option value="">UF</option>{["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map(u=><option key={u}>{u}</option>)}</select></div></label><label>Curso cadastrado<select value={editing.course_id||""} onChange={e=>setEditing(x=>({...x,course_id:e.target.value}))}><option value="">Selecione um curso</option>{courses.map(c=><option key={c.id} value={c.id}>{c.name} — {c.code}</option>)}</select></label><label>Situação<select value={editing.status||"em_espera"} onChange={e=>setEditing(x=>({...x,status:e.target.value}))}><option value="em_espera">Em espera</option><option value="concluindo">Concluindo</option><option value="concluiu">Concluiu</option></select></label></div></section>}
 </div>;
}
