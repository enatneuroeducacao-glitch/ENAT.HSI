import { supabase } from "./supabaseClient";

const requireClient=()=>{if(!supabase)throw new Error("A conexão da Central ENAT HSI com o Supabase não está configurada.");return supabase;};
const usernameToEmail=(username)=>`${String(username||"").trim().toLowerCase()}@enat.local`;
const invoke=async(name,body,anonymous=false)=>{const client=requireClient();if(!anonymous){const {data,error}=await client.auth.getSession();if(error)throw new Error(error.message);if(!data.session)throw new Error("Acesso administrativo necessário. Faça login.");}const {data,error}=await client.functions.invoke(name,{body});if(error)throw new Error(error.message||"Falha na operação administrativa.");return data;};
export const getSession=async()=>{const {data,error}=await requireClient().auth.getSession();if(error)throw new Error(error.message);return data.session;};
export const signInUsername=async(username,password)=>{const u=String(username||"").trim().toLowerCase();if(!u)throw new Error("Informe o usuário.");const {data,error}=await requireClient().auth.signInWithPassword({email:usernameToEmail(u),password});if(error)throw new Error("Usuário ou senha inválidos.");return data.session;};
export const signOut=()=>requireClient().auth.signOut();
export const bootstrapAdmin=()=>invoke("manage-admin-users",{action:"bootstrap"},true);
export const getAdminProfile=()=>invoke("manage-admin-users",{action:"me"});
export const listAdminUsers=()=>invoke("manage-admin-users",{action:"list"});
export const createAdminUser=(user)=>invoke("manage-admin-users",{action:"create",...user});
export const updateAdminUser=(id,user)=>invoke("manage-admin-users",{action:"update",id,...user});
export const deleteAdminUser=(id)=>invoke("manage-admin-users",{action:"delete",id});
export const changeMyPassword=(password)=>invoke("manage-admin-users",{action:"change_password",password});
