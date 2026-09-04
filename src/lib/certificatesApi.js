import { supabase } from "./supabaseClient";

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://qkpsxbcsngowljqhyvit.supabase.co";

function requireClient() {
  if (!supabase) throw new Error("A conexão da Central ENAT HSI com o Supabase ainda não foi configurada.");
  return supabase;
}

async function invoke(name, body) {
  const client = requireClient();
  const { data: sessionData, error: sessionError } = await client.auth.getSession();
  if (sessionError) throw new Error(sessionError.message || "Não foi possível verificar a sessão administrativa.");
  if (!sessionData.session) throw new Error("Acesso administrativo necessário. Faça login.");
  const { data, error } = await client.functions.invoke(name, { body });
  if (error) throw new Error(error.message || "Falha ao executar a operação.");
  return data;
}

export async function getSession() { const client=requireClient(); const {data,error}=await client.auth.getSession(); if(error) throw new Error(error.message); return data.session; }
export async function signIn(email,password){const client=requireClient();const {data,error}=await client.auth.signInWithPassword({email,password});if(error)throw new Error(error.message);return data.session;}
export async function signUp(email,password){const client=requireClient();const redirectTo=`${window.location.origin}/emissor`;const {data,error}=await client.auth.signUp({email,password,options:{emailRedirectTo:redirectTo}});if(error)throw new Error(error.message);return data.session;}
export async function signOut(){return requireClient().auth.signOut();}
export async function issueCertificate(certificate){const {code:_clientCode,...payload}=certificate||{};return invoke("issue-certificate",payload);}
export async function cancelCertificate(code,status){return invoke("cancel-certificate",{code,status});}
export async function listCertificates(){return invoke("list-certificates",{});}
export async function listInstructors(){return invoke("manage-instructors",{action:"list"});}
export async function createInstructor(instructor){return invoke("manage-instructors",{action:"create",...instructor});}
export async function deleteInstructor(id){return invoke("manage-instructors",{action:"delete",id});}
export async function listCourses(){return invoke("manage-courses",{action:"list"});}
export async function createCourse(course){return invoke("manage-courses",{action:"create",course});}
export async function updateCourse(id,course){return invoke("manage-courses",{action:"update",id,course});}
export async function duplicateCourse(id){return invoke("manage-courses",{action:"duplicate",id});}
export async function archiveCourse(id){return invoke("manage-courses",{action:"archive",id});}
export async function publishCourse(id,published){return invoke("manage-courses",{action:"publish",id,published});}
export async function validateCertificate(code){const normalized=String(code||"").trim().toUpperCase();if(!normalized)return {valid:false,certificate:null,error:"Código não informado"};const response=await fetch(`${SUPABASE_URL}/functions/v1/validate-certificate`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code:normalized})});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||"Não foi possível validar o certificado.");return data;}
