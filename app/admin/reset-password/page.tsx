"use client";

import { useEffect, useState } from "react";
import { supabase, supabaseConfigurationError } from "../../../lib/supabase";

const formatError=(error:unknown)=>{
  const message=error instanceof Error?error.message:typeof error==="object"&&error&&"message" in error?String(error.message):"Erreur inconnue";
  return /failed to fetch|fetch failed|network/i.test(message)
    ? "Impossible de joindre Supabase. Vérifiez votre connexion puis réessayez."
    : message;
};

export default function ResetPasswordPage(){
  const [password,setPassword]=useState("");
  const [confirmPassword,setConfirmPassword]=useState("");
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);
  const [ready,setReady]=useState(false);

  useEffect(()=>{
    if(!supabase){setMessage(supabaseConfigurationError||"Configuration Supabase invalide.");return}

    supabase.auth.getSession().then(({data,error})=>{
      if(error)setMessage(formatError(error));
      if(data.session)setReady(true);
    }).catch(error=>setMessage(formatError(error)));

    const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{
      if(event==="PASSWORD_RECOVERY"||session)setReady(true);
    });

    return()=>subscription.unsubscribe();
  },[]);

  async function updatePassword(e:React.FormEvent){
    e.preventDefault();
    if(!supabase)return;
    if(password.length<8){setMessage("Le mot de passe doit contenir au moins 8 caractères.");return}
    if(password!==confirmPassword){setMessage("Les deux mots de passe ne correspondent pas.");return}
    setBusy(true);setMessage("Mise à jour du mot de passe…");
    try{
      const {error}=await supabase.auth.updateUser({password});
      if(error)throw error;
      setMessage("Mot de passe modifié ✓ Redirection vers l’administration…");
      setTimeout(()=>{window.location.href="/admin"},1200);
    }catch(error){setMessage(formatError(error))}finally{setBusy(false)}
  }

  return <main className="reset-shell"><section className="reset-card"><p className="eyebrow">SNIFF AND FUN</p><h1>Nouveau mot de passe</h1><p>Choisis un nouveau mot de passe pour ton compte administrateur.</p>{!ready&&!message&&<p className="message">Vérification du lien de récupération…</p>}{ready&&<form onSubmit={updatePassword}><label>Nouveau mot de passe<input type="password" value={password} onChange={e=>setPassword(e.target.value)} minLength={8} required disabled={busy}/></label><label>Confirmer le mot de passe<input type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} minLength={8} required disabled={busy}/></label><button type="submit" disabled={busy}>{busy?"Mise à jour…":"Enregistrer le nouveau mot de passe"}</button></form>}{!ready&&message&&<p className="hint">Si le lien est expiré ou invalide, retourne à la page Administration et demande un nouveau courriel de récupération.</p>}{message&&<p className="message" role="alert">{message}</p>}<a className="back" href="/admin">Retour à l’administration</a></section><style jsx global>{`
body{margin:0;background:#f7f6f1;color:#152018;font-family:Arial,Helvetica,sans-serif}.reset-shell{min-height:100vh;display:grid;place-items:center;padding:24px}.reset-card{width:min(480px,100%);box-sizing:border-box;background:#fff;border:1px solid #e3e1d8;border-radius:16px;padding:28px;box-shadow:0 8px 28px rgba(25,45,28,.05)}.reset-card h1{color:#0a3d12;margin:6px 0 10px}.eyebrow{font-size:12px;font-weight:800;letter-spacing:.14em;color:#119647}.reset-card label{display:flex;flex-direction:column;gap:7px;font-weight:700;margin:14px 0}.reset-card input{box-sizing:border-box;width:100%;border:1px solid #d9d7cd;border-radius:9px;padding:11px 12px;font:inherit}.reset-card button{border:0;border-radius:10px;padding:11px 16px;font-weight:700;cursor:pointer;background:#0a3d12;color:#fff;width:100%;margin-top:8px}.reset-card button:disabled{opacity:.55;cursor:not-allowed}.message{padding:10px;background:#f3f4ee;border-radius:8px}.hint{font-size:13px;color:#697169}.back{display:inline-block;margin-top:16px;color:#0a3d12;font-weight:700;text-decoration:none}
`}</style></main>;
}
