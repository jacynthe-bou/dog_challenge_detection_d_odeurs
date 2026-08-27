"use client";

import { useMemo, useState } from "react";
import { Home, Trophy, Target, Dog, Clock3, CheckCircle2, BookOpen, PackageCheck, BarChart3, Settings, LogOut, PawPrint, Flame, Star, ArrowRight, Lightbulb } from "lucide-react";
import { challenges, Challenge } from "../data/challenges";
import Timer from "../components/Timer";

type Screen = "home" | "challenges" | "weekly" | "ranking" | "profile" | "lexicon";
const categories = ["Intérieur", "Extérieur", "Lieu public"] as const;

export default function Page() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selected, setSelected] = useState<Challenge | null>(null);
  const currentLevel = 1;
  const completed = challenges.filter(c => c.completed).length;
  const total = challenges.length;
  const progress = Math.round((completed / total) * 100);
  const grouped = useMemo(() => categories.map(category => ({ category, items: challenges.filter(c => c.category === category) })), []);
  const go = (next: Screen) => { setScreen(next); setSelected(null); };

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand-block brand-image-block">
          <img src="/brand-logo.jpg" alt="Sniff and Fun Challenge" className="sidebar-logo" />
        </div>
        <nav>
          <NavButton active={screen === "home"} onClick={() => go("home")} icon={<Home size={19}/>} label="Accueil" />
          <NavButton active={screen === "challenges"} onClick={() => go("challenges")} icon={<Trophy size={19}/>} label="Défis" />
          <NavButton active={screen === "weekly"} onClick={() => go("weekly")} icon={<Target size={19}/>} label="Défi hebdomadaire" />
          <NavButton active={screen === "ranking"} onClick={() => go("ranking")} icon={<BarChart3 size={19}/>} label="Progression" />
          <NavButton active={screen === "lexicon"} onClick={() => go("lexicon")} icon={<BookOpen size={19}/>} label="Lexique" />
          <NavButton active={screen === "profile"} onClick={() => go("profile")} icon={<Dog size={19}/>} label="Profil" />
          <button className="nav-btn muted-nav" disabled><Settings size={19}/><span>Paramètres</span></button>
        </nav>
        <div className="sidebar-profile">
          <div className="avatar">🐕</div>
          <div><strong>Nova</strong><span>Niveau {currentLevel}</span></div>
          <div className="mini-progress"><span style={{width:`${Math.max(progress,12)}%`}}/></div>
        </div>
        <button className="logout" disabled><LogOut size={18}/> Déconnexion</button>
      </aside>

      <section className="content">
        {selected ? <ChallengeDetail challenge={selected} onBack={() => setSelected(null)} />
        : screen === "home" ? <HomeScreen progress={progress} completed={completed} total={total} onChallenges={() => go("challenges")} onSelect={setSelected} />
        : screen === "challenges" ? <ChallengesScreen grouped={grouped} onSelect={setSelected} />
        : screen === "weekly" ? <WeeklyScreen />
        : screen === "ranking" ? <ProgressScreen progress={progress} completed={completed} total={total} />
        : screen === "lexicon" ? <LexiconScreen />
        : <ProfileScreen />}
      </section>
    </main>
  );
}

function NavButton({active, onClick, icon, label}: any) { return <button className={`nav-btn ${active ? "active" : ""}`} onClick={onClick}>{icon}<span>{label}</span></button>; }

function HomeScreen({progress, completed, total, onChallenges, onSelect}: any) {
  const featured = challenges.slice(0,2);
  return <div className="dashboard">
    <section className="brand-hero sniff-fun-hero">
      <img src="/sniff-fun-hero.jpg" alt="Sniff and Fun Challenge — chien reniflant un contenant d’odeur dans un salon avec une femme heureuse en arrière-plan" />
      <div className="hero-copy hero-copy-light">
        <div className="hero-brand-name">Sniff and Fun <span>Challenge</span></div>
        <h1>Défi de détection d’odeurs<br/>pour chiens.</h1>
        <p>Des défis progressifs, simples et motivants à pratiquer à la maison avec votre chien.</p>
        <button className="accent-button" onClick={onChallenges}>Commencer un défi</button>
      </div>
    </section>

    <section className="welcome-strip">
      <div className="welcome-icon"><PawPrint size={28}/></div>
      <div><h2>Bonjour !</h2><p>Prêt pour une nouvelle aventure olfactive avec votre chien ?</p></div>
      <div className="quick-stats">
        <div><Flame size={25}/><span><small>Série actuelle</small><strong>5 jours</strong></span></div>
        <div><Star size={25}/><span><small>Points totaux</small><strong>2 450</strong></span></div>
      </div>
    </section>

    <div className="dashboard-grid">
      <section className="panel available-panel">
        <div className="panel-heading"><div><p className="eyebrow">À PRATIQUER</p><h2>Défis disponibles</h2></div><button className="text-link" onClick={onChallenges}>Voir tous <ArrowRight size={16}/></button></div>
        <div className="featured-grid">{featured.map((c: Challenge) => <article className="featured-card" key={c.id}>
          <div className={`featured-image image-${c.id}`}><span>NIVEAU 1</span><div className="scene-icon">{c.id===1 ? "🚪🐕" : "🪑🐕"}</div></div>
          <div className="featured-body"><h3>{c.title}</h3><p>{c.description}</p><div className="featured-footer"><span><Trophy size={16}/>{c.completed ? "Réussi" : "À faire"}</span><button className="accent-button small" onClick={() => onSelect(c)}>Commencer</button></div></div>
        </article>)}</div>
      </section>

      <section className="panel progress-panel">
        <div className="panel-heading"><div><p className="eyebrow">PARCOURS</p><h2>Ma progression</h2></div></div>
        <div className="progress-layout">
          <div className="progress-ring" style={{"--pct": `${Math.max(progress,8)*3.6}deg`} as React.CSSProperties}><div><small>NIVEAU</small><strong>1</strong><span>{completed}/{total} défis</span></div></div>
          <div className="progress-list">
            <p><Trophy size={18}/><span>Défis réussis</span><strong>{completed}</strong></p>
            <p><Clock3 size={18}/><span>Temps d'entraînement</span><strong>—</strong></p>
            <p><CheckCircle2 size={18}/><span>Progression</span><strong>{progress}%</strong></p>
            <p><Flame size={18}/><span>Meilleure série</span><strong>5 jours</strong></p>
          </div>
        </div>
        <button className="green-button wide">Voir ma progression complète</button>
      </section>
    </div>

    <section className="tip-strip"><div className="tip-icon"><Lightbulb size={26}/></div><div><h3>Conseil du jour</h3><p>Laisse ton chien prendre son temps et suivre son nez. Chaque réussite renforce sa confiance !</p></div><div className="scent-trail">〰  •  🐾  •  🐾</div></section>
  </div>;
}

function ChallengesScreen({grouped, onSelect}: any) { return <><header className="page-header"><p className="eyebrow">NIVEAU 1</p><h1>Mes défis</h1><p>Complète toutes les catégories pour débloquer le niveau suivant.</p></header>{grouped.map((g:any)=><section key={g.category} className="category-section"><h2>{g.category}</h2><div className="challenge-grid">{g.items.map((c:Challenge)=><button className="challenge-card" key={c.id} onClick={()=>onSelect(c)}><div className="challenge-top"><span className="number">{c.id}</span>{c.completed?<CheckCircle2 size={20} className="done"/>:<span className="status">À faire</span>}</div><h3>{c.title}</h3><p>{c.description}</p><small>{formatDuration(c.duration)} max</small></button>)}</div></section>)}</>; }

function ChallengeDetail({challenge,onBack}:{challenge:Challenge,onBack:()=>void}) { const [result,setResult]=useState<"success"|"retry"|null>(null); return <><button className="back" onClick={onBack}>← Retour aux défis</button><div className="detail-card"><div className="detail-heading"><div><span className="pill">{challenge.category} · Niveau {challenge.level}</span><h1>{challenge.title}</h1></div><strong className="time-badge"><Clock3 size={18}/>{formatDuration(challenge.duration)}</strong></div><p className="lead">{challenge.objective||challenge.description}</p>{challenge.materials&&<DetailSection icon={<PackageCheck size={20}/>} title="Matériel"><ul className="detail-list">{challenge.materials.map(item=><li key={item}>{item}</li>)}</ul></DetailSection>}{challenge.installation&&<DetailSection title="Installation"><ol className="numbered-list">{challenge.installation.map(item=><li key={item}>{item}</li>)}</ol></DetailSection>}{challenge.steps&&<DetailSection title="Déroulement"><ol className="numbered-list">{challenge.steps.map(item=><li key={item}>{item}</li>)}</ol></DetailSection>}<div className="instruction-box"><h3>Critères de réussite</h3>{(challenge.successCriteria||["Le chien identifie correctement la cache."]).map(item=><p key={item}>✓ {item}</p>)}</div><div className="timer-label">Chronomètre · maximum {formatDuration(challenge.duration)}</div><Timer seconds={challenge.duration}/><div className="result-actions"><button className="accent-button" onClick={()=>setResult("success")}>✓ Défi réussi</button><button className="secondary" onClick={()=>setResult("retry")}>À reprendre</button></div>{result&&<div className={`result-message ${result}`}>{result==="success"?"Bravo! Le défi est marqué comme réussi pour ce test.":"Tu pourras reprendre ce défi quand tu veux."}</div>}</div></>; }

function DetailSection({title,icon,children}:{title:string,icon?:React.ReactNode,children:React.ReactNode}) { return <section className="detail-section"><h3>{icon}{title}</h3>{children}</section>; }
function formatDuration(seconds:number){const minutes=Math.floor(seconds/60);const rest=seconds%60;return rest?`${minutes} min ${rest} s`:`${minutes} min`;}

function ProgressScreen({progress,completed,total}:any){return <><header className="page-header"><p className="eyebrow">MON PARCOURS</p><h1>Progression</h1><p>Un aperçu de l’avancement de votre chien.</p></header><div className="grid"><article className="hero-card"><span className="pill">Niveau 1</span><h2>Progression générale</h2><div className="big-number">{progress}%</div><p>{completed} défis réussis sur {total}</p><div className="progress"><span style={{width:`${progress}%`}}/></div></article><article className="card"><h3>Objectif du niveau</h3><p>5 défis intérieurs</p><p>5 défis extérieurs</p><p>2 défis en lieu public</p></article></div></>}
function LexiconScreen(){const words=[["Source","Endroit précis où se trouve l'odeur cible."],["Cache","Emplacement choisi pour placer l'odeur ou la nourriture pendant l'exercice."],["Conducteur","Personne qui accompagne le chien pendant la recherche."],["Marquer verbalement","Utiliser un mot précis, par exemple « YES », lorsque le chien trouve la source."],["Leurrer","Guider temporairement le chien avec une récompense pour l'éloigner de la source."],["Odeur cible","Odeur que le chien a appris à rechercher et à identifier."]];return <><header className="page-header"><p className="eyebrow">RÉFÉRENCE</p><h1>Lexique</h1><p>Les mots importants utilisés dans les défis.</p></header><div className="lexicon-grid">{words.map(([w,d])=><article className="card" key={w}><h3>{w}</h3><p className="muted">{d}</p></article>)}</div></>}
function WeeklyScreen(){return <><header className="page-header"><p className="eyebrow">CETTE SEMAINE</p><h1>Défi hebdomadaire · Niveau 1</h1><p>Trois recherches à compléter pour participer au classement.</p></header><div className="weekly-list">{["Recherche intérieure","Recherche extérieure","Recherche en environnement nouveau"].map((x,i)=><div className="weekly-item" key={x}><span className="number">{i+1}</span><div><h3>{x}</h3><p>Consignes à venir.</p></div><button className="secondary">Commencer</button></div>)}</div></>}
function ProfileScreen(){return <><header className="page-header"><p className="eyebrow">PROFIL</p><h1>Mon chien</h1></header><div className="profile-card"><div className="dog-avatar">🐕</div><div><h2>Nova</h2><p>Profil de démonstration</p><p>Niveau 1 · Débutant</p></div></div></>}
