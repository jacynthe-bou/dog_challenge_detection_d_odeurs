"use client";

import { useMemo, useState } from "react";
import { Home, Trophy, Target, Dog, Clock3, Lock, CheckCircle2 } from "lucide-react";
import { challenges, Challenge } from "../data/challenges";
import Timer from "../components/Timer";

type Screen = "home" | "challenges" | "weekly" | "ranking" | "profile";

const categories = ["Intérieur", "Extérieur", "Lieu public"] as const;

export default function Page() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selected, setSelected] = useState<Challenge | null>(null);
  const currentLevel = 1;

  const completed = challenges.filter(c => c.completed).length;
  const total = challenges.length;
  const progress = Math.round((completed / total) * 100);

  const grouped = useMemo(() => categories.map(category => ({
    category,
    items: challenges.filter(c => c.category === category)
  })), []);

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">Dog Challenge 🐾</div>
        <nav>
          <NavButton active={screen === "home"} onClick={() => {setScreen("home");setSelected(null);}} icon={<Home size={19}/>} label="Accueil" />
          <NavButton active={screen === "challenges"} onClick={() => {setScreen("challenges");setSelected(null);}} icon={<Target size={19}/>} label="Défis" />
          <NavButton active={screen === "weekly"} onClick={() => {setScreen("weekly");setSelected(null);}} icon={<Clock3 size={19}/>} label="Défi hebdomadaire" />
          <NavButton active={screen === "ranking"} onClick={() => {setScreen("ranking");setSelected(null);}} icon={<Trophy size={19}/>} label="Classement" />
          <NavButton active={screen === "profile"} onClick={() => {setScreen("profile");setSelected(null);}} icon={<Dog size={19}/>} label="Mon chien" />
        </nav>
        <div className="level-box">
          <small>NIVEAU ACTUEL</small>
          <strong>Niveau {currentLevel}</strong>
          <span>{completed}/{total} défis complétés</span>
        </div>
      </aside>

      <section className="content">
        {selected ? (
          <ChallengeDetail challenge={selected} onBack={() => setSelected(null)} />
        ) : screen === "home" ? (
          <HomeScreen progress={progress} completed={completed} total={total} onChallenges={() => setScreen("challenges")} />
        ) : screen === "challenges" ? (
          <ChallengesScreen grouped={grouped} onSelect={setSelected} />
        ) : screen === "weekly" ? (
          <WeeklyScreen />
        ) : screen === "ranking" ? (
          <RankingScreen />
        ) : (
          <ProfileScreen />
        )}
      </section>
    </main>
  );
}

function NavButton({active, onClick, icon, label}: any) {
  return <button className={`nav-btn ${active ? "active" : ""}`} onClick={onClick}>{icon}<span>{label}</span></button>
}

function HomeScreen({progress, completed, total, onChallenges}: any) {
  return <>
    <header><p className="eyebrow">TABLEAU DE BORD</p><h1>Salut 👋</h1><p>Prêt pour une nouvelle recherche avec ton chien?</p></header>
    <div className="grid">
      <article className="hero-card">
        <div>
          <span className="pill">Niveau 1 · Débutant</span>
          <h2>Progression</h2>
          <div className="big-number">{progress}%</div>
          <p>{completed} défis réussis sur {total}</p>
          <div className="progress"><span style={{width: `${progress}%`}} /></div>
          <button className="primary wide" onClick={onChallenges}>Voir mes défis</button>
        </div>
      </article>
      <article className="card">
        <h3>Défi hebdomadaire</h3>
        <p className="muted">3 recherches à compléter cette semaine.</p>
        <div className="weekly-bars"><span/><span/><span/></div>
        <p><strong>0 / 3</strong> recherche complétée</p>
      </article>
      <article className="card">
        <h3>Prochain niveau</h3>
        <p>Complète les 12 défis du niveau 1 pour débloquer le niveau 2.</p>
        <div className="lock-box"><Lock size={24}/> Niveau 2 verrouillé</div>
      </article>
      <article className="card">
        <h3>Catégories</h3>
        <p>🏠 5 défis intérieur</p>
        <p>🌲 5 défis extérieur</p>
        <p>👥 2 défis en lieu public</p>
      </article>
    </div>
  </>
}

function ChallengesScreen({grouped, onSelect}: any) {
  return <>
    <header><p className="eyebrow">NIVEAU 1</p><h1>Mes défis</h1><p>Complète toutes les catégories pour débloquer le niveau suivant.</p></header>
    {grouped.map((g: any) => (
      <section key={g.category} className="category-section">
        <h2>{g.category}</h2>
        <div className="challenge-grid">
          {g.items.map((c: Challenge) => (
            <button className="challenge-card" key={c.id} onClick={() => onSelect(c)}>
              <div className="challenge-top">
                <span className="number">{c.id}</span>
                {c.completed ? <CheckCircle2 size={20} className="done"/> : <span className="status">À faire</span>}
              </div>
              <h3>{c.title}</h3>
              <p>{c.description}</p>
              <small>{Math.round(c.duration / 60)} min max</small>
            </button>
          ))}
        </div>
      </section>
    ))}
  </>
}

function ChallengeDetail({challenge, onBack}: {challenge: Challenge, onBack: () => void}) {
  return <>
    <button className="back" onClick={onBack}>← Retour aux défis</button>
    <div className="detail-card">
      <span className="pill">{challenge.category} · Niveau {challenge.level}</span>
      <h1>{challenge.title}</h1>
      <p className="lead">{challenge.description}</p>
      <div className="instruction-box">
        <h3>Critères de réussite</h3>
        <p>✓ Le chien identifie correctement la cache.</p>
        <p>✓ Aucune fausse alerte.</p>
        <p>✓ La recherche est terminée avant la fin du temps.</p>
      </div>
      <Timer seconds={challenge.duration} />
      <div className="result-actions">
        <button className="primary">Marquer comme réussi</button>
        <button className="secondary">Recherche non réussie</button>
      </div>
    </div>
  </>
}

function WeeklyScreen() {
  return <>
    <header><p className="eyebrow">CETTE SEMAINE</p><h1>Défi hebdomadaire · Niveau 1</h1><p>Complète trois recherches pour apparaître au classement.</p></header>
    <div className="weekly-list">
      {["Recherche intérieure", "Recherche extérieure", "Recherche en environnement nouveau"].map((x, i) => (
        <div className="weekly-item" key={x}><span className="number">{i+1}</span><div><h3>{x}</h3><p>Consignes à venir dans la version administrable.</p></div><button className="secondary">Commencer</button></div>
      ))}
    </div>
  </>
}

function RankingScreen() {
  const rows = [["1", "Marie & Nova", "285 pts"], ["2", "Julie & Pixel", "270 pts"], ["3", "Alex & Loki", "255 pts"], ["4", "Sophie & Milo", "230 pts"]];
  return <>
    <header><p className="eyebrow">NIVEAU 1</p><h1>Classement hebdomadaire</h1><p>Tu te mesures uniquement aux participants de ton niveau.</p></header>
    <div className="ranking">
      {rows.map(r => <div className="rank-row" key={r[0]}><strong>#{r[0]}</strong><span>{r[1]}</span><b>{r[2]}</b></div>)}
    </div>
  </>
}

function ProfileScreen() {
  return <>
    <header><p className="eyebrow">PROFIL</p><h1>Mon chien</h1></header>
    <div className="profile-card">
      <div className="dog-avatar">🐕</div>
      <div><h2>Nova</h2><p>Border Collie · 3 ans</p><p>Niveau 1 · Débutant</p></div>
    </div>
  </>
}
