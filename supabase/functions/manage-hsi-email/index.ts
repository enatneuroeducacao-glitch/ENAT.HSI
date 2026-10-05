import { createClient } from "npm:@supabase/supabase-js@2";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature"};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,"Content-Type":"application/json"}});
const env=(name:string)=>{const v=Deno.env.get(name);if(!v)throw new Error("Configuração ausente: "+name);return v;};
const dbFor=(token?:string)=>createClient(env("SUPABASE_URL"),env("SUPABASE_SERVICE_ROLE_KEY"),token?{global:{headers:{Authorization:"Bearer "+token}}}:undefined);
async function requireAdmin(req:Request){
 const authorization=req.headers.get("Authorization")||"";
 if(!authorization.startsWith("Bearer "))throw new Error("Acesso administrativo necessário.");
 const ac=createClient(env("SUPABASE_URL"),env("SUPABASE_ANON_KEY"),{global:{headers:{Authorization:authorization}}});
 const {data:{user},error}=await ac.auth.getUser(); if(error||!user)throw new Error("Sessão administrativa inválida.");
 const db=dbFor(); const {data:p,error:pe}=await db.from("admin_profiles").select("id,role,active").eq("id",user.id).maybeSingle();
 if(pe)throw pe;if(!p?.active||p.role!=="admin")throw new Error("Usuário sem autorização administrativa.");return db;
}
const addresses=(v:unknown)=>Array.isArray(v)?v.map(x=>String(x||"").trim()).filter(Boolean):String(v||"").split(/[;,]/).map(x=>x.trim()).filter(Boolean);
async function resend(path:string,init:RequestInit={}){
 const r=await fetch("https://api.resend.com"+path,{...init,headers:{"Authorization":"Bearer "+env("RESEND_API_KEY"),"Content-Type":"application/json",...(init.headers||{})}});
 const raw=await r.text();let data:any={};try{data=raw?JSON.parse(raw):{}}catch{data={raw}};
 if(!r.ok)throw new Error(data?.message||data?.error||("Resend HTTP "+r.status));return data;
}
async function verifyWebhook(req:Request,raw:string){
 const secret=env("RESEND_WEBHOOK_SECRET");const {Webhook}=await import("npm:svix@1.76.0");const wh=new Webhook(secret);
 return wh.verify(raw,{"svix-id":req.headers.get("svix-id")||"","svix-timestamp":req.headers.get("svix-timestamp")||"","svix-signature":req.headers.get("svix-signature")||""}) as any;
}
async function handleWebhook(req:Request){
 const event=await verifyWebhook(req,await req.text());if(event?.type!=="email.received")return json({ok:true,ignored:true});
 const d=event.data||{},db=dbFor();const eventId=event.id||d.email_id;
 const {data:existing}=await db.from("enat_mail_messages").select("id").eq("provider_event_id",eventId).maybeSingle();if(existing)return json({ok:true,duplicate:true});
 const detail=await resend("/emails/receiving/"+encodeURIComponent(d.email_id));const x=detail?.data||detail||{};
 const tos=addresses(d.to||x.to);const primary=(tos.find((a:string)=>a.toLowerCase().endsWith("@hsi-doth-pg.com.br"))||tos[0]||"").toLowerCase();
 const {data:mb}=await db.from("enat_mailboxes").select("id").eq("address",primary).maybeSingle();
 const rawFrom=String(d.from||x.from||"");const m=rawFrom.match(/^(.*)<([^>]+)>$/);const fromAddress=(m?m[2]:rawFrom).trim().toLowerCase();
 const fromName=m?m[1].trim().replace(/^"|"$/g,""):null;
 const {error}=await db.from("enat_mail_messages").insert({provider_email_id:d.email_id||null,provider_event_id:eventId,message_id:d.message_id||x.message_id||null,direction:"inbound",mailbox_id:mb?.id||null,from_address:fromAddress,from_name:fromName,to_addresses:tos,cc_addresses:addresses(d.cc||x.cc),bcc_addresses:addresses(d.bcc||x.bcc),reply_to:x.reply_to||d.reply_to||null,subject:d.subject||x.subject||"(sem assunto)",text_body:x.text||x.text_body||null,html_body:x.html||x.html_body||null,folder:"inbox",attachments:d.attachments||x.attachments||[],created_at:d.created_at||event.created_at||new Date().toISOString()});
 if(error&&error.code!=="23505")throw error;return json({ok:true});
}
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 try{
  if(req.method==="POST"&&!req.headers.get("Authorization")&&req.headers.get("svix-id"))return await handleWebhook(req);
  const db=await requireAdmin(req),b=await req.json(),action=String(b.action||"");
  if(action==="mailboxes"){const {data,error}=await db.from("enat_mailboxes").select("id,address,display_name,active,sort_order").eq("active",true).order("sort_order");if(error)throw error;return json({mailboxes:data||[]});}
  if(action==="list"){
   let q=db.from("enat_mail_messages").select("id,provider_email_id,message_id,direction,mailbox_id,from_address,from_name,to_addresses,cc_addresses,subject,text_body,folder,read_at,sent_at,in_reply_to,references_header,attachments,created_at,updated_at,mailbox:enat_mailboxes(id,address,display_name)").order("created_at",{ascending:false}).limit(100);
   const folder=String(b.folder||"inbox");if(folder!=="all")q=q.eq("folder",folder);if(b.mailbox_id)q=q.eq("mailbox_id",String(b.mailbox_id));
   const {data,error}=await q;if(error)throw error;return json({messages:data||[]});
  }
  if(action==="read"){const id=String(b.id||"");const {data,error}=await db.from("enat_mail_messages").select("*,mailbox:enat_mailboxes(id,address,display_name)").eq("id",id).maybeSingle();if(error)throw error;if(!data)throw new Error("Mensagem não encontrada.");await db.from("enat_mail_messages").update({read_at:new Date().toISOString()}).eq("id",id);data.read_at=new Date().toISOString();return json({message:data});}
  if(action==="status"){const id=String(b.id||""),folder=["inbox","sent","archive","trash"].includes(String(b.folder))?String(b.folder):"inbox";const patch:any={folder};if(b.read===true)patch.read_at=new Date().toISOString();if(b.read===false)patch.read_at=null;const {data,error}=await db.from("enat_mail_messages").update(patch).eq("id",id).select().single();if(error)throw error;return json({message:data});}
  if(action==="send"){
   const from=String(b.from||"").trim().toLowerCase(),to=addresses(b.to),cc=addresses(b.cc),bcc=addresses(b.bcc),subject=String(b.subject||"").trim(),textBody=String(b.text||"").trim();
   if(!from||!to.length||!subject||!textBody)throw new Error("Remetente, destinatário, assunto e mensagem são obrigatórios.");
   const {data:mb,error:me}=await db.from("enat_mailboxes").select("id,address,display_name").eq("address",from).eq("active",true).maybeSingle();if(me)throw me;if(!mb)throw new Error("Endereço de remetente não autorizado.");
   const headers:any={};if(b.in_reply_to)headers["In-Reply-To"]=String(b.in_reply_to);if(b.references_header)headers.References=String(b.references_header);
   const payload:any={from:mb.display_name+" <"+mb.address+">",to,subject,text:textBody};if(cc.length)payload.cc=cc;if(bcc.length)payload.bcc=bcc;if(b.reply_to)payload.reply_to=b.reply_to;if(Object.keys(headers).length)payload.headers=headers;
   const sent=await resend("/emails",{method:"POST",body:JSON.stringify(payload)});
   const {data:row,error}=await db.from("enat_mail_messages").insert({provider_email_id:sent?.id||null,direction:"outbound",mailbox_id:mb.id,from_address:mb.address,from_name:mb.display_name,to_addresses:to,cc_addresses:cc,bcc_addresses:bcc,reply_to:b.reply_to||null,subject,text_body:textBody,folder:"sent",sent_at:new Date().toISOString(),in_reply_to:b.in_reply_to||null,references_header:b.references_header||null}).select().single();if(error)throw error;return json({ok:true,message:row,resend_id:sent?.id||null});
  }
  throw new Error("Ação inválida.");
 }catch(e){return json({error:String((e as any)?.message||e)},400);}
});