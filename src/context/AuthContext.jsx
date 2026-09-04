import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getSession, getAdminProfile, signOut } from "../lib/authApi";
import { supabase } from "../lib/supabaseClient";

const AuthContext=createContext(null);
export function AuthProvider({children}){
 const [session,setSession]=useState(null);const [profile,setProfile]=useState(null);const [loading,setLoading]=useState(true);const [error,setError]=useState("");
 const refresh=async()=>{setLoading(true);setError("");try{const current=await getSession();if(!current){setSession(null);setProfile(null);return;}const me=await getAdminProfile();if(!me?.profile?.active)throw new Error("Usuário sem autorização para acessar a Central ENAT HSI.");setSession(current);setProfile(me.profile);}catch(err){setSession(null);setProfile(null);setError(err?.message||"Não foi possível validar sua autorização.");try{await signOut()}catch{}}finally{setLoading(false)}};
 useEffect(()=>{refresh();if(!supabase)return undefined;const {data}=supabase.auth.onAuthStateChange((_event,nextSession)=>{setSession(nextSession);if(!nextSession){setProfile(null);setLoading(false);return;}setTimeout(()=>refresh(),0)});return()=>data?.subscription?.unsubscribe()},[]);
 const value=useMemo(()=>({session,profile,loading,error,refresh}),[session,profile,loading,error]);return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth(){const value=useContext(AuthContext);if(!value)throw new Error("useAuth deve ser usado dentro de AuthProvider");return value;}
