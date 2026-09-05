import { createClient } from "npm:@supabase/supabase-js@2";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"};
const json=(b:any,s=200)=>new Response(JSON.stringify(b),{status:s,headers:{...cors,"Content-Type":"application/json"}});

async function admin(req:any){
  const h=req.headers.get("Authorization")||"";
  if(!h.startsWith("Bearer "))throw new Error("Acesso administrativo necessário.");
  const url=Deno.env.get("SUPABASE_URL")!,anon=Deno.env.get("SUPABASE_ANON_KEY")!,service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ac=createClient(url,anon,{global:{headers:{Authorization:h}}});
  const {data:{user},error}=await ac.auth.getUser();
  if(error||!user)throw new Error("Sessão administrativa inválida.");
  const db=createClient(url,service);
  const {data:p,error:pe}=await db.from("admin_profiles").select("id,role,active").eq("id",user.id).maybeSingle();
  if(pe)throw pe;
  if(!p?.active||!["admin","operador","superadmin","administrator"].includes(String(p.role||"").toLowerCase()))throw new Error("Usuário sem autorização administrativa.");
  return {db,user};
}

Deno.serve(async(req)=>{
  if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
  try{
    const {db,user}=await admin(req),b=await req.json(),a=b.action;
    if(a==="list"){
      const {data,error}=await db.from("enat_instructors").select("*").eq("active",true).order("name");
      if(error)throw error;
      return json({instructors:data||[]});
    }
    if(a==="create"){
      const r={name:String(b.name||"").trim(),qualification:String(b.qualification||"Especialista").trim(),formation:String(b.formation||"").trim(),institution:b.institution?String(b.institution).trim():null,registration:b.registration?String(b.registration).trim():null,active:true};
      if(!r.name||!r.formation)throw new Error("Nome e formação são obrigatórios.");
      const {data,error}=await db.from("enat_instructors").insert(r).select().single();
      if(error)throw error;
      return json({instructor:data},201);
    }
    if(a==="delete"){
      const id=String(b.id||"").trim();
      if(!id)throw new Error("Docente não informado.");
      const {data:current,error:readError}=await db.from("enat_instructors").select("*").eq("id",id).maybeSingle();
      if(readError)throw readError;
      if(!current)throw new Error("Docente não encontrado.");
      const {data,error}=await db.from("enat_instructors").update({active:false}).eq("id",id).select().single();
      if(error)throw error;
      return json({instructor:data,deleted:true,deleted_by:user.id});
    }
    throw new Error("Ação inválida.");
  }catch(e){return json({error:String((e as any)?.message||e)},400);}
});
