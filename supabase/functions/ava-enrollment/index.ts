import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,"Content-Type":"application/json"}});
const db=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const clean=(v:unknown,n=300)=>String(v??"").trim().slice(0,n);
const hash=async(value:string)=>{const bytes=new TextEncoder().encode(value);const digest=await crypto.subtle.digest("SHA-256",bytes);return Array.from(new Uint8Array(digest)).map(x=>x.toString(16).padStart(2,"0")).join("");};
const token=()=>Array.from(crypto.getRandomValues(new Uint8Array(32))).map(x=>x.toString(16).padStart(2,"0")).join("");
async function currentUser(req:Request){const bearer=(req.headers.get("Authorization")||"").replace(/^Bearer\s+/i,"");if(!bearer)return null;const {data,error}=await db.auth.getUser(bearer);if(error||!data.user)return null;return data.user;}
async function isAdmin(userId:string){const {data}=await db.from("admin_profiles").select("id").eq("id",userId).eq("active",true).eq("role","admin").maybeSingle();return Boolean(data);}
async function createCourseCheckout(user:any,course:any){
 const token=Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
 const base=new URL(Deno.env.get("PUBLIC_APP_URL")||"https://www.hsi-doth-pg.com.br").origin;
 const webhook=Deno.env.get("MERCADOPAGO_WEBHOOK_URL")||`${Deno.env.get("SUPABASE_URL")}/functions/v1/mercadopago-webhook`;
 if(!token)return {error:"Mercado Pago ainda não está configurado no servidor."};
 if(!course.price_cents||Number(course.price_cents)<=0)return {error:"O preço deste curso ainda não foi configurado."};
 const {data:existing}=await db.from("ava_payments").select("id,status,checkout_url,amount_cents,currency").eq("user_id",user.id).eq("course_id",course.id).eq("status","pending").not("checkout_url","is",null).order("created_at",{ascending:false}).limit(1).maybeSingle();
 if(existing?.checkout_url)return {payment:existing,checkout_url:existing.checkout_url};
 const paymentId=crypto.randomUUID();const externalReference=`ava:${paymentId}:${user.id}:${course.id}`;
 const {data:payment,error:insertError}=await db.from("ava_payments").insert({id:paymentId,user_id:user.id,course_id:course.id,payment_method:"checkout_pro",status:"pending",amount_cents:course.price_cents,currency:course.currency||"BRL",provider:"mercado_pago",external_reference:externalReference}).select("id,status,amount_cents,currency,external_reference").single();
 if(insertError)throw insertError;
 const preference={items:[{id:course.id,title:course.title,description:clean(course.description,250),quantity:1,currency_id:course.currency||"BRL",unit_price:Number(course.price_cents)/100}],payer:{email:user.email},external_reference:externalReference,back_urls:{success:`${base}/academia?payment=success&course_id=${course.id}`,pending:`${base}/academia?payment=pending&course_id=${course.id}`,failure:`${base}/academia?payment=failure&course_id=${course.id}`},auto_return:"approved",notification_url:webhook,metadata:{ava_payment_id:payment.id,course_id:course.id,user_id:user.id},statement_descriptor:"ENAT"};
 const response=await fetch("https://api.mercadopago.com/checkout/preferences",{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify(preference)});
 const result=await response.json();
 if(!response.ok||!result.init_point){await db.from("ava_payments").update({status:"rejected",metadata:{checkout_error:result},updated_at:new Date().toISOString()}).eq("id",payment.id);return {error:"Não foi possível criar o checkout do Mercado Pago.",details:result};}
 const {error:updateError}=await db.from("ava_payments").update({checkout_url:result.init_point,metadata:{preference_id:String(result.id||""),sandbox_init_point:result.sandbox_init_point||null},updated_at:new Date().toISOString()}).eq("id",payment.id);
 if(updateError)throw updateError;
 return {payment:{...payment,external_reference:externalReference,checkout_url:result.init_point},checkout_url:result.init_point};
}
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 if(req.method!=="POST")return json({error:"Método não permitido."},405);
 try{
  const user=await currentUser(req);if(!user)return json({error:"Faça login para continuar."},401);
  const body=await req.json();const action=clean(body.action,40);
  if(action==="create_invite"){
   if(!(await isAdmin(user.id)))return json({error:"Acesso administrativo necessário."},403);
   const email=clean(body.email,180).toLowerCase(),courseId=clean(body.course_id,80);
   if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return json({error:"Informe um e-mail válido."},400);
   const {data:course,error:courseError}=await db.from("ava_courses").select("id,title,status,payment_required,price_cents").eq("id",courseId).maybeSingle();
   if(courseError)throw courseError;if(!course||course.status!=="published")return json({error:"Curso não encontrado ou não publicado."},404);
   const raw=token(),tokenHash=await hash(raw),expiresAt=new Date(Date.now()+7*86400000).toISOString();
   const {data:invite,error}=await db.from("ava_enrollment_invites").insert({course_id:course.id,email,token_hash:tokenHash,created_by:user.id,expires_at:expiresAt,payment_waived:body.payment_waived===true}).select("id,email,course_id,expires_at,payment_waived").single();
   if(error)throw error;
   const base=clean(body.public_base,300)||"https://www.hsi-doth-pg.com.br";
   return json({ok:true,invite,invite_url:base.replace(/\/$/,"")+"/academia?convite="+raw});
  }
  if(action==="redeem_invite"){
   const raw=clean(body.token,200);if(raw.length<40)return json({error:"Convite inválido."},400);
   const tokenHash=await hash(raw);
   const {data:invite,error}=await db.from("ava_enrollment_invites").select("id,email,course_id,status,expires_at,payment_waived").eq("token_hash",tokenHash).maybeSingle();
   if(error)throw error;if(!invite)return json({error:"Convite não encontrado ou inválido."},404);
   if(invite.status!=="pending")return json({error:"Este convite já foi utilizado ou revogado."},409);
   if(new Date(invite.expires_at).getTime()<Date.now()){await db.from("ava_enrollment_invites").update({status:"expired",updated_at:new Date().toISOString()}).eq("id",invite.id);return json({error:"Este convite expirou. Solicite um novo acesso ao ENAT."},410);}
   if(clean(user.email,180).toLowerCase()!==clean(invite.email,180).toLowerCase())return json({error:"Entre com o mesmo e-mail para o qual o convite foi enviado."},403);
   const {data:course,error:courseError}=await db.from("ava_courses").select("id,title,payment_required,price_cents").eq("id",invite.course_id).maybeSingle();
   if(courseError)throw courseError;if(!course)return json({error:"Curso não encontrado."},404);
   await db.from("ava_profiles").upsert({id:user.id,email:user.email,full_name:clean(user.user_metadata?.full_name||user.user_metadata?.name,180),role:"student"},{onConflict:"id",ignoreDuplicates:true});
   const {data:existing,error:existingError}=await db.from("ava_enrollments").select("id,status").eq("user_id",user.id).eq("course_id",course.id).maybeSingle();
   if(existingError)throw existingError;
   if(existing&&["active","completed"].includes(existing.status)){await db.from("ava_enrollment_invites").update({status:"redeemed",redeemed_by:user.id,redeemed_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq("id",invite.id).eq("status","pending");return json({ok:true,course:{id:course.id,title:course.title},enrollment:existing});}
   if(course.payment_required&&Number(course.price_cents||0)>0&&!invite.payment_waived){const checkout=await createCourseCheckout(user,course);if(checkout.error)return json({error:checkout.error,details:checkout.details||null},503);return json({ok:true,payment_required:true,course:{id:course.id,title:course.title},payment:checkout.payment,checkout_url:checkout.checkout_url});}
   let enrollment=existing;
   if(!enrollment){const {data,error}=await db.from("ava_enrollments").insert({user_id:user.id,course_id:course.id,status:"active",access_source:"invite",created_by:user.id}).select("id,status").single();if(error)throw error;enrollment=data;}
   const {data:claimed,error:claimError}=await db.from("ava_enrollment_invites").update({status:"redeemed",redeemed_by:user.id,redeemed_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq("id",invite.id).eq("status","pending").select("id").maybeSingle();
   if(claimError)throw claimError;if(!claimed&&invite.status==="pending")return json({error:"O convite foi utilizado em outra sessão. Atualize a página e entre novamente."},409);
   return json({ok:true,course:{id:course.id,title:course.title},enrollment});
  }
  if(action==="create_payment_request"){
   const courseId=clean(body.course_id,80);
   const {data:course,error}=await db.from("ava_courses").select("id,title,description,payment_required,price_cents,currency").eq("id",courseId).eq("status","published").maybeSingle();
   if(error)throw error;if(!course||!course.payment_required||!Number(course.price_cents||0))return json({error:"O preço e a cobrança deste curso ainda não foram configurados pelo ENAT."},409);
   const {data:invite,error:inviteError}=await db.from("ava_enrollment_invites").select("id").eq("course_id",course.id).eq("email",clean(user.email,180).toLowerCase()).eq("status","pending").gt("expires_at",new Date().toISOString()).maybeSingle();
   if(inviteError)throw inviteError;if(!invite)return json({error:"Não há convite pendente para este curso e e-mail."},403);
   const checkout=await createCourseCheckout(user,course);if(checkout.error)return json({error:checkout.error,details:checkout.details||null},503);
   return json({ok:true,payment:checkout.payment,checkout_url:checkout.checkout_url});
  }
  if(action==="approve_manual_payment"){
   if(!(await isAdmin(user.id)))return json({error:"Acesso administrativo necessário."},403);
   const paymentId=clean(body.payment_id,80);
   const {data:payment,error}=await db.from("ava_payments").select("id,user_id,course_id,status,payment_method").eq("id",paymentId).maybeSingle();
   if(error)throw error;if(!payment)return json({error:"Pagamento não encontrado."},404);if(payment.status!=="pending")return json({error:"Este pagamento não está pendente."},409);if(payment.payment_method!=="manual")return json({error:"Este pagamento não é manual. A confirmação deve vir do webhook autenticado do provedor."},409);
   const {data:enrollment,error:enrollmentError}=await db.from("ava_enrollments").upsert({user_id:payment.user_id,course_id:payment.course_id,status:"active",access_source:"payment",created_by:user.id},{onConflict:"user_id,course_id"}).select("id,status").single();
   if(enrollmentError)throw enrollmentError;
   const {error:updateError}=await db.from("ava_payments").update({status:"approved",paid_at:new Date().toISOString(),enrollment_id:enrollment.id,updated_at:new Date().toISOString()}).eq("id",payment.id);
   if(updateError)throw updateError;
   return json({ok:true,enrollment});
  }
  return json({error:"Ação não reconhecida."},400);
 }catch(error){return json({error:error instanceof Error?error.message:"Falha interna."},400);}
});