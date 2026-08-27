"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase, supabaseConfigurationError } from "../../lib/supabase";

type Settings = {
  id:number; app_name:string; tagline:string; hero_text:string; hero_image_url:string|null; logo_url:string|null;
  primary_color:string; secondary_color:string; accent_color:string;
};

type ChallengeRow = {
  id:number; title:string; description:string; objective:string; level:number; category:string; duration_seconds:number;
  materials:string[]; installation:string[]; steps:string[]; success_criteria:string[]; image_url:string|null; video_url:string|null;
  published:boolean; sort_order:number;
};

const splitLines=(value:string)=>value.split("\n").map(v=>v.trim()).filter(Boolean);
const joinLines=(value:string[]|null|undefined)=>(value||[]).join("\n");
const formatError=(error:unknown)=>{
  const message=error instanceof Error?error.message:typeof error==="object"&&error&&"message" in error?String(error.message):"Erreur inconnue";
  return /failed to fetch|fetch failed|network/i.test(message)
    ? "Impossible de joindre Supabase. Vérifiez la connexion, les variables Vercel et l’état du projet, puis réessayez."
    : message;
};

export default function AdminPage(){
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [user,setUser]=useState<User|null>(null);
  const [isAdmin,setIsAdmin]=useState(false);
  const [message,setMessage]=useState("");
  const [authLoading,setAuthLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  const [settings,setSettings]=useState<Settings|null>(null);
  const [challenges,setChallenges]=useState<ChallengeRow[]>([]);
  const [selected,setSelected]=useState<ChallengeRow|null>(null);
  const [tab,setTab]=useState<"brand"|"challenges">("brand");

  useEffect(()=>{
    if(!supabase){setMessage(supabaseConfigurationError||"Configuration Supabase invalide.");setAuthLoading(false);return}
    supabase.auth.getUser().then(({data,error})=>{if(error)setMessage(formatError(error));if(data.user){setUser(data.user);void checkAdmin(data.user.id)}}).catch(error=>setMessage(formatError(error))).finally(()=>setAuthLoading(false));
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_e,session)=>{setUser(session?.user||null);if(session?.user)checkAdmin(session.user.id);else setIsAdmin(false)});
    return()=>subscription.unsubscribe();
  },[]);

  async function checkAdmin(id:string){
    if(!supabase)return;
    setAuthLoading(true);
    try{const {data,error}=await supabase.from("profiles").select("role").eq("id",id).single();if(error)throw error;
      const ok=data?.role==="admin";setIsAdmin(ok);if(ok)await loadContent();
    }catch(error){setIsAdmin(false);setMessage(formatError(error))}finally{setAuthLoading(false)}
  }

  async function loadContent(){
    if(!supabase)return;
    const [{data:s,error:settingsError},{data:c,error:challengesError}]=await Promise.all([
      supabase.from("site_settings").select("*").eq("id",1).single(),
      supabase.from("challenges").select("*").order("sort_order")
    ]);
    if(settingsError)throw settingsError;if(challengesError)throw challengesError;
    if(s)setSettings(s as Settings);if(c)setChallenges(c as ChallengeRow[]);
  }

  async function login(e:React.FormEvent){e.preventDefault();if(!supabase)return;setBusy(true);setMessage("Connexion…");try{const {error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error;setMessage("Connecté.")}catch(error){setMessage(formatError(error))}finally{setBusy(false)}}
  async function logout(){if(!supabase)return;setBusy(true);try{const {error}=await supabase.auth.signOut();if(error)throw error;setMessage("")}catch(error){setMessage(formatError(error))}finally{setBusy(false)}}

  async function saveSettings(){
    if(!settings||!supabase)return;setBusy(true);setMessage("Enregistrement…");
    try{const {error}=await supabase.from("site_settings").update({...settings,updated_at:new Date().toISOString()}).eq("id",1);if(error)throw error;setMessage("Image de marque enregistrée ✓")}catch(error){setMessage(formatError(error))}finally{setBusy(false)}
  }

  async function saveChallenge(){
    if(!selected||!supabase)return;setBusy(true);setMessage("Enregistrement…");
    try{const {error}=await supabase.from("challenges").update(selected).eq("id",selected.id);if(error)throw error;
      setChallenges(list=>list.map(c=>c.id===selected.id?selected:c));setMessage("Défi enregistré ✓")
    }catch(error){setMessage(formatError(error))}finally{setBusy(false)}
  }

  async function uploadImage(file:File,kind:"hero"|"logo"|"challenge"){
    if(!supabase)return;
    if(!file.type.startsWith("image/")||file.size>5*1024*1024){setMessage("Choisis une image valide de 5 Mo maximum.");return}
    setBusy(true);setMessage("Téléversement de l’image…");
    const safe=file.name.toLowerCase().replace(/[^a-z0-9.]+/g,"-");
    const path=`${kind}/${Date.now()}-${safe}`;
    try{const {error}=await supabase.storage.from("app-media").upload(path,file,{upsert:false,contentType:file.type});if(error)throw error;
      const {data}=supabase.storage.from("app-media").getPublicUrl(path);
      if(kind==="hero"&&settings)setSettings({...settings,hero_image_url:data.publicUrl});
      if(kind==="logo"&&settings)setSettings({...settings,logo_url:data.publicUrl});
      if(kind==="challenge"&&selected)setSelected({...selected,image_url:data.publicUrl});
      setMessage("Image téléversée. Clique ensuite sur Enregistrer ✓")
    }catch(error){setMessage(formatError(error))}finally{setBusy(false)}
  }

  if(authLoading)return <AdminShell><div className="login-card"><h1>Administration</h1><p>Vérification de la session…</p></div></AdminShell>;
  if(!user)return <AdminShell><div className="login-card"><h1>Administration</h1><p>Connecte-toi avec un compte administrateur créé de manière sécurisée dans Supabase.</p><form onSubmit={login}><label>Courriel<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required disabled={busy}/></label><label>Mot de passe<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={8} disabled={busy}/></label><button type="submit" disabled={busy||!supabase}>{busy?"Connexion…":"Se connecter"}</button></form><p className="hint">Le premier administrateur doit être créé manuellement selon la procédure sécurisée du fichier README.</p>{message&&<p className="message" role="alert">{message}</p>}</div></AdminShell>;

  if(!isAdmin)return <AdminShell><div className="login-card"><h1>Accès refusé</h1><p>Ce compte est authentifié, mais ne possède pas le rôle administrateur.</p><button onClick={logout} disabled={busy}>Déconnexion</button>{message&&<p className="message" role="alert">{message}</p>}</div></AdminShell>;

  return <AdminShell><header className="admin-header"><div><p className="eyebrow">SNIFF AND FUN</p><h1>Administration</h1><p>Modifie les textes, images et couleurs sans toucher au code.</p></div><div className="header-actions"><a href="/" target="_blank">Voir l’application</a><button onClick={logout} disabled={busy}>Déconnexion</button></div></header>
    <div className="tabs"><button className={tab==="brand"?"active":""} onClick={()=>setTab("brand")}>Image de marque</button><button className={tab==="challenges"?"active":""} onClick={()=>setTab("challenges")}>Défis</button></div>
    {message&&<div className="notice" role="status">{message}</div>}

    {tab==="brand"&&settings&&<section className="admin-grid"><div className="editor-card"><h2>Textes de l’accueil</h2><label>Nom de l’application<input value={settings.app_name} onChange={e=>setSettings({...settings,app_name:e.target.value})}/></label><label>Sous-titre<input value={settings.tagline} onChange={e=>setSettings({...settings,tagline:e.target.value})}/></label><label>Texte d’introduction<textarea rows={4} value={settings.hero_text} onChange={e=>setSettings({...settings,hero_text:e.target.value})}/></label><h2>Couleurs</h2><div className="color-grid"><label>Vert foncé<input type="color" value={settings.primary_color} onChange={e=>setSettings({...settings,primary_color:e.target.value})}/><input value={settings.primary_color} onChange={e=>setSettings({...settings,primary_color:e.target.value})}/></label><label>Vert<input type="color" value={settings.secondary_color} onChange={e=>setSettings({...settings,secondary_color:e.target.value})}/><input value={settings.secondary_color} onChange={e=>setSettings({...settings,secondary_color:e.target.value})}/></label><label>Or<input type="color" value={settings.accent_color} onChange={e=>setSettings({...settings,accent_color:e.target.value})}/><input value={settings.accent_color} onChange={e=>setSettings({...settings,accent_color:e.target.value})}/></label></div><button className="save" onClick={saveSettings} disabled={busy}>{busy?"Enregistrement…":"Enregistrer les changements"}</button></div>
      <div className="editor-card"><h2>Images</h2><MediaField title="Image principale" url={settings.hero_image_url} onFile={f=>uploadImage(f,"hero")} disabled={busy}/><MediaField title="Logo" url={settings.logo_url} onFile={f=>uploadImage(f,"logo")} disabled={busy}/><p className="hint">Images de 5 Mo maximum. Elles sont stockées dans Supabase.</p></div></section>}

    {tab==="challenges"&&<section className="challenge-admin"><aside className="challenge-list"><h2>Défis</h2>{challenges.map(c=><button key={c.id} className={selected?.id===c.id?"active":""} onClick={()=>setSelected({...c})}><span>{c.sort_order}</span><div><strong>{c.title}</strong><small>{c.category} · Niveau {c.level}</small></div></button>)}</aside>
      <div className="editor-card challenge-editor">{selected?<><div className="editor-title"><div><p className="eyebrow">DÉFI {selected.sort_order}</p><h2>{selected.title}</h2></div><label className="publish"><input type="checkbox" checked={selected.published} onChange={e=>setSelected({...selected,published:e.target.checked})}/> Publié</label></div><div className="two"><label>Titre<input value={selected.title} onChange={e=>setSelected({...selected,title:e.target.value})}/></label><label>Catégorie<select value={selected.category} onChange={e=>setSelected({...selected,category:e.target.value})}><option>Intérieur</option><option>Extérieur</option><option>Lieu public</option></select></label></div><label>Description<textarea rows={3} value={selected.description} onChange={e=>setSelected({...selected,description:e.target.value})}/></label><label>Objectif<textarea rows={3} value={selected.objective} onChange={e=>setSelected({...selected,objective:e.target.value})}/></label><div className="two"><label>Durée maximale (secondes)<input type="number" value={selected.duration_seconds} onChange={e=>setSelected({...selected,duration_seconds:Number(e.target.value)})}/></label><label>Ordre<input type="number" value={selected.sort_order} onChange={e=>setSelected({...selected,sort_order:Number(e.target.value)})}/></label></div><MediaField title="Image du défi" url={selected.image_url} onFile={f=>uploadImage(f,"challenge")} disabled={busy}/><label>Matériel <small>Une ligne par élément</small><textarea rows={5} value={joinLines(selected.materials)} onChange={e=>setSelected({...selected,materials:splitLines(e.target.value)})}/></label><label>Installation <small>Une ligne par étape</small><textarea rows={6} value={joinLines(selected.installation)} onChange={e=>setSelected({...selected,installation:splitLines(e.target.value)})}/></label><label>Déroulement <small>Une ligne par étape</small><textarea rows={6} value={joinLines(selected.steps)} onChange={e=>setSelected({...selected,steps:splitLines(e.target.value)})}/></label><label>Critères de réussite <small>Une ligne par critère</small><textarea rows={5} value={joinLines(selected.success_criteria)} onChange={e=>setSelected({...selected,success_criteria:splitLines(e.target.value)})}/></label><button className="save" onClick={saveChallenge} disabled={busy}>{busy?"Enregistrement…":"Enregistrer ce défi"}</button></>:<div className="empty"><h2>Choisis un défi</h2><p>Sélectionne un défi dans la colonne de gauche pour le modifier.</p></div>}</div></section>}
  </AdminShell>;
}

function MediaField({title,url,onFile,disabled=false}:{title:string,url:string|null,onFile:(f:File)=>void,disabled?:boolean}){return <div className="media-field"><strong>{title}</strong>{url?<img src={url} alt="Aperçu"/>:<div className="media-empty">Aucune image personnalisée</div>}<label className="file-button">Choisir une nouvelle image<input type="file" accept="image/*" disabled={disabled} onChange={e=>{const f=e.target.files?.[0];if(f)onFile(f)}}/></label></div>}
function AdminShell({children}:{children:React.ReactNode}){return <main className="admin-shell">{children}<style jsx global>{`
body{margin:0;background:#f7f6f1;color:#152018;font-family:Arial,Helvetica,sans-serif}.admin-shell{max-width:1320px;margin:auto;padding:32px}.admin-header{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;margin-bottom:24px}.admin-header h1{font-size:38px;margin:4px 0}.admin-header p{margin:6px 0;color:#59635b}.eyebrow{font-size:12px;font-weight:800;letter-spacing:.14em;color:#119647}.header-actions{display:flex;gap:10px}.header-actions a,.header-actions button,.admin-shell button{border:0;border-radius:10px;padding:11px 16px;font-weight:700;cursor:pointer;background:#0a3d12;color:#fff;text-decoration:none}.admin-shell button:disabled{opacity:.55;cursor:not-allowed}.tabs{display:flex;gap:8px;margin:0 0 20px}.tabs button{background:#e8e9e2;color:#344038}.tabs button.active{background:#0a3d12;color:#fff}.notice{background:#fff7cf;border:1px solid #ead77d;padding:12px 16px;border-radius:10px;margin-bottom:18px}.admin-grid{display:grid;grid-template-columns:1.2fr .8fr;gap:20px}.editor-card,.login-card{background:#fff;border:1px solid #e3e1d8;border-radius:16px;padding:24px;box-shadow:0 8px 28px rgba(25,45,28,.05)}.editor-card h2{margin:0 0 18px;color:#0a3d12}.editor-card label,.login-card label{display:flex;flex-direction:column;gap:7px;font-weight:700;margin:14px 0}.editor-card input,.editor-card textarea,.editor-card select,.login-card input{box-sizing:border-box;width:100%;border:1px solid #d9d7cd;border-radius:9px;padding:11px 12px;font:inherit;background:#fff}.editor-card textarea{resize:vertical}.editor-card small{font-weight:400;color:#737b74}.two,.color-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.color-grid{grid-template-columns:repeat(3,1fr)}.color-grid label input[type=color]{height:50px;padding:4px}.save{background:#119647!important;margin-top:14px}.secondary{background:#e8e9e2!important;color:#243026!important}.login-card{max-width:480px;margin:9vh auto}.login-card h1{color:#0a3d12}.login-card form{display:grid;gap:4px}.login-card button{margin-top:8px}.message{padding:10px;background:#f3f4ee;border-radius:8px}.media-field{border-top:1px solid #eceae1;padding:18px 0}.media-field:first-of-type{border-top:0}.media-field>strong{display:block;margin-bottom:10px}.media-field img{width:100%;max-height:260px;object-fit:cover;border-radius:12px;border:1px solid #e2e0d7}.media-empty{padding:36px;border:1px dashed #c9c8bf;border-radius:12px;text-align:center;color:#727970}.file-button{display:inline-block!important;width:auto!important;background:#f0f2ec;padding:10px 13px;border-radius:9px;margin-top:10px!important;cursor:pointer}.file-button input{display:none}.hint{font-size:13px;color:#697169}.challenge-admin{display:grid;grid-template-columns:310px 1fr;gap:20px}.challenge-list{background:#fff;border:1px solid #e3e1d8;border-radius:16px;padding:18px;height:fit-content}.challenge-list h2{margin:2px 4px 14px;color:#0a3d12}.challenge-list button{width:100%;display:flex;text-align:left;gap:12px;align-items:center;background:transparent;color:#263129;border-radius:10px;padding:10px}.challenge-list button:hover,.challenge-list button.active{background:#edf4e9;color:#0a3d12}.challenge-list button>span{display:grid;place-items:center;min-width:30px;height:30px;border-radius:50%;background:#ffcb05;color:#0a3d12}.challenge-list strong,.challenge-list small{display:block}.challenge-list small{font-weight:400;opacity:.7;margin-top:3px}.editor-title{display:flex;justify-content:space-between;gap:20px}.publish{flex-direction:row!important;align-items:center!important;margin:0!important}.publish input{width:auto!important}.empty{text-align:center;padding:80px 20px;color:#747b75}@media(max-width:850px){.admin-shell{padding:18px}.admin-header{display:block}.header-actions{margin-top:16px}.admin-grid,.challenge-admin{grid-template-columns:1fr}.challenge-list{max-height:320px;overflow:auto}.two,.color-grid{grid-template-columns:1fr}}
`}</style></main>}
