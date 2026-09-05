import { createClient } from "npm:@supabase/supabase-js@2";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"};
const json=(b:unknown,s=200)=>new Response(JSON.stringify(b),{status:s,headers:{...cors,"Content-Type":"application/json","Cache-Control":"no-store"}});
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS") return new Response("ok",{headers:cors});
 try{
  const auth=req.headers.get("Authorization")||""; if(!auth.startsWith("Bearer ")) throw new Error("Acesso administrativo necessário.");
  const anon=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_ANON_KEY")!,{global:{headers:{Authorization:auth}}});
  const {data:{user},error:ae}=await anon.auth.getUser(); if(ae||!user) throw new Error("Sessão administrativa inválida.");
  const admin=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const {data:profile}=await admin.from("admin_profiles").select("id,role,active").eq("id",user.id).maybeSingle();
  if(!profile?.active) throw new Error("Usuário sem autorização ativa para a Central ENAT HSI.");
  const body=await req.json().catch(()=>({}));
  const reason=String(body.reason||"manual").slice(0,120);
  const tables=["enat_courses","enat_instructors","enat_students","enat_certificates","enat_course_audit","admin_profiles","admin_access_grants"];
  const snapshot:any={};
  for(const table of tables){ const {data,error}=await admin.from(table).select("*"); if(error) throw error; snapshot[table]=data||[]; }
  const {data:row,error}=await admin.from("enat_central_backups").insert({reason,created_by:user.id,snapshot}).select("id,created_at,reason").single();
  if(error) throw error;
  return json({ok:true,backup:row});
 }catch(e){return json({error:String((e as any)?.message||e)},400)}
});
