import { createClient } from "npm:@supabase/supabase-js@2";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,"Content-Type":"application/json"}});

const env=(name:string)=>{const v=Deno.env.get(name);if(!v)throw new Error(`Configuração ausente: ${name}`);return v;};
const normalize=(v:unknown)=>String(v??"").trim().toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g,"");
const usernameOf=(u:any)=>String(u?.user_metadata?.username||u?.email?.split("@")[0]||"").trim();

async function requireAdmin(req:Request){
  const authorization=req.headers.get("Authorization")||"";
  if(!authorization.startsWith("Bearer ")) throw new Error("Acesso administrativo necessário. Faça login.");
  const url=env("SUPABASE_URL"), anon=env("SUPABASE_ANON_KEY"), service=env("SUPABASE_SERVICE_ROLE_KEY");
  const ac=createClient(url,anon,{global:{headers:{Authorization:authorization}}});
  const {data:{user},error}=await ac.auth.getUser();
  if(error||!user) throw new Error("Sessão administrativa inválida.");
  const db=createClient(url,service);
  const {data:profile,error:pe}=await db.from("admin_profiles").select("id,email,full_name,role,active").eq("id",user.id).maybeSingle();
  if(pe) throw pe;
  if(!profile?.active||profile.role!=="admin") throw new Error("Usuário sem autorização administrativa.");
  return {user,profile,db};
}

Deno.serve(async(req)=>{
  if(req.method==="OPTIONS") return new Response("ok",{headers:cors});
  try{
    const b=await req.json();
    const action=String(b.action||"");

    if(action==="bootstrap"){
      const db=createClient(env("SUPABASE_URL"),env("SUPABASE_SERVICE_ROLE_KEY"));
      const {count}=await db.from("admin_profiles").select("id",{count:"exact",head:true});
      if((count||0)>0) throw new Error("A inicialização administrativa já foi concluída.");
      const username=String(b.username||"vilmar_becker").trim();
      const password=String(b.password||"");
      if(password.length<6) throw new Error("A senha deve ter no mínimo 6 caracteres.");
      const email=`${username}@enat.local`;
      const {data,error}=await db.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{username,display_name:b.display_name||username}});
      if(error||!data.user) throw error||new Error("Não foi possível criar o administrador inicial.");
      await db.from("admin_profiles").insert({id:data.user.id,email:data.user.email,full_name:b.display_name||username,role:"admin",active:true});
      return json({ok:true,user:{id:data.user.id,username,email:data.user.email,display_name:b.display_name||username,role:"admin",active:true}},201);
    }

    const {user,db}=await requireAdmin(req);

    if(action==="list"){
      const {data:profiles,error:pe}=await db.from("admin_profiles").select("id,email,full_name,role,active,created_at").order("created_at",{ascending:true});
      if(pe) throw pe;
      const {data:authData,error:ae}=await db.auth.admin.listUsers({page:1,perPage:1000});
      if(ae) throw ae;
      const authById=new Map((authData.users||[]).map((u:any)=>[u.id,u]));
      const users=(profiles||[]).map((p:any)=>{const au=authById.get(p.id);return {id:p.id,username:usernameOf(au)||String(p.email||"").split("@")[0],display_name:p.full_name||au?.user_metadata?.display_name||String(p.email||"").split("@")[0],role:p.role,active:Boolean(p.active),email:p.email||au?.email||null,created_at:p.created_at};});
      return json({users});
    }

    if(action==="create"){
      const username=String(b.username||"").trim().toLowerCase();
      const displayName=String(b.display_name||username).trim();
      const password=String(b.password||"");
      const role=b.role==="admin"?"admin":"operador";
      if(!/^[a-z0-9._-]{1,32}$/.test(username)) throw new Error("Nome de usuário inválido.");
      if(password.length<6) throw new Error("A senha deve ter no mínimo 6 caracteres.");
      const {data:existing}=await db.from("admin_profiles").select("id").ilike("email",`${username}@enat.local`).maybeSingle();
      if(existing) throw new Error("Esse usuário já existe.");
      const email=`${username}@enat.local`;
      const {data:created,error}=await db.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{username,display_name:displayName}});
      if(error||!created.user) throw error||new Error("Não foi possível criar o usuário.");
      const {data:profile,error:pe}=await db.from("admin_profiles").insert({id:created.user.id,email,full_name:displayName,role,active:true}).select().single();
      if(pe){await db.auth.admin.deleteUser(created.user.id);throw pe;}
      return json({user:{id:profile.id,username,display_name:displayName,role,active:true,email}},201);
    }

    if(action==="update"){
      const id=String(b.id||"");
      if(!id) throw new Error("Usuário não informado.");
      if(id===user.id && b.active===false) throw new Error("Não é permitido desativar o próprio acesso.");
      const patch:any={full_name:String(b.display_name||"").trim(),role:b.role==="admin"?"admin":"operador",active:Boolean(b.active)};
      const {data:profile,error:pe}=await db.from("admin_profiles").update(patch).eq("id",id).select().single();
      if(pe) throw pe;
      if(b.password){const password=String(b.password);if(password.length<6)throw new Error("A senha deve ter no mínimo 6 caracteres.");const {error}=await db.auth.admin.updateUserById(id,{password});if(error)throw error;}
      const {data:au}=await db.auth.admin.getUserById(id);
      if(au?.user) await db.auth.admin.updateUserById(id,{user_metadata:{...(au.user.user_metadata||{}),username:usernameOf(au.user),display_name:patch.full_name}});
      return json({user:{id:profile.id,username:usernameOf(au?.user)||String(profile.email||"").split("@")[0],display_name:profile.full_name,role:profile.role,active:profile.active,email:profile.email}});
    }

    if(action==="change_password"){
      const password=String(b.password||"");
      if(password.length<6) throw new Error("A senha deve ter no mínimo 6 caracteres.");
      const {error}=await db.auth.admin.updateUserById(user.id,{password});
      if(error) throw error;
      return json({ok:true});
    }

    if(action==="delete"){
      const id=String(b.id||"");
      if(!id) throw new Error("Usuário não informado.");
      if(id===user.id) throw new Error("Não é permitido excluir o próprio acesso.");
      const {data:target}=await db.from("admin_profiles").select("id,role,active").eq("id",id).maybeSingle();
      if(!target) throw new Error("Usuário não encontrado.");
      if(target.role==="admin"){
        const {count}=await db.from("admin_profiles").select("id",{count:"exact",head:true}).eq("role","admin").eq("active",true);
        if((count||0)<=1) throw new Error("Não é possível excluir o último administrador ativo.");
      }
      await db.from("admin_access_grants").update({active:false,revoked_at:new Date().toISOString()}).eq("user_id",id).eq("active",true);
      const {error}=await db.from("admin_profiles").update({active:false}).eq("id",id);
      if(error) throw error;
      return json({ok:true});
    }

    throw new Error("Ação inválida.");
  }catch(e){return json({error:String((e as any)?.message||e)},400);}
});
