import { supabase } from "./supabaseClient";

const requireClient=()=>{if(!supabase)throw new Error("A conexão da Central ENAT HSI com o Supabase não está configurada.");return supabase;};
const normalize=(value)=>String(value||"").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const usernameAliases={"vilmar becker":"vilmar.becker.vb@gmail.com","vilmar_becker":"vilmar.becker.vb@gmail.com","vilmar":"vilmar.becker.vb@gmail.com","enat neuroeducacao":"enat.neuroeducacao@gmail.com","enat":"enat.neuroeducacao@gmail.com","transitando conhecimento":"transitandoconhecimento@gmail.com"};
export const getSession=async()=>{const {data,error}=await requireClient().auth.getSession();if(error)throw new Error(error.message);return data.session;};
export const signInUsername=async(username,password)=>{const client=requireClient();const raw=String(username||"").trim();const key=normalize(raw);if(!raw)throw new Error("Informe o usuário.");if(!password)throw new Error("Informe a senha.");let email=raw.includes("@")?raw.toLowerCase():usernameAliases[key]||`${raw.toLowerCase()}@enat.local`;const {data,error}=await client.auth.signInWithPassword({email,password});if(error)throw new Error("Usuário ou senha inválidos.");if(!data?.session)throw new Error("Não foi possível iniciar a sessão.");return data.session;};
export const getAdminProfile=async()=>{const client=requireClient();const session=await getSession();if(!session?.user?.id)throw new Error("Acesso administrativo necessário. Faça login.");const {data,error}=await client.from("admin_profiles").select("id,email,full_name,role,active").eq("id",session.user.id).maybeSingle();if(error)throw new Error(error.message);if(!data)throw new Error("Usuário autenticado sem perfil administrativo autorizado.");if(data.active===false)throw new Error("Usuário administrativo inativo.");return {profile:data};};
export const signOut=()=>requireClient().auth.signOut();
const invoke=async(name,body,anonymous=false)=>{const client=requireClient();if(!anonymous){const {data,error}=await client.auth.getSession();if(error)throw new Error(error.message);if(!data.session)throw new Error("Acesso administrativo necessário. Faça login.");}const {data,error}=await client.functions.invoke(name,{body});if(error)throw new Error(error.message||"Falha na operação administrativa.");return data;};
export const bootstrapAdmin=()=>invoke("manage-admin-users",{action:"bootstrap"},true);
export const listAdminUsers=()=>invoke("manage-admin-users",{action:"list"});
export const createAdminUser=(user)=>invoke("manage-admin-users",{action:"create",...user});
export const updateAdminUser=(id,user)=>invoke("manage-admin-users",{action:"update",id,...user});
export const deleteAdminUser=(id)=>invoke("manage-admin-users",{action:"delete",id});
export const changeMyPassword=(password)=>invoke("manage-admin-users",{action:"change_password",password});
