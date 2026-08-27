"use client";

import { useMemo, useState } from "react";
import { Home, Trophy, Target, Dog, Clock3, Lock, CheckCircle2, BookOpen, PackageCheck } from "lucide-react";
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
        <div className="brand-block">
          <div className="brand-mark">👃</div>
          <div className="brand-copy"><strong>DÉTECTION D’ODEURS</strong><span>CHALLENGE</span></div>
        </div>
        <nav>
          <NavButton active={screen === "home"} onClick={() => go("home")} icon={<Home size={19}/>} label="Accueil" />
          <NavButton active={screen === "challenges"} onClick={() => go("challenges")} icon={<Target size={19}/>} label="Défis" />
          <NavButton active={screen === "weekly"} onClick={() => go("weekly")} icon={<Clock3 size={19}/>} label="Défi hebdomadaire" />
          <NavButton active={screen === "ranking"} onClick={() => go("ranking")} icon={<Trophy size={19}/>} label="Classement" />
          <NavButton active={screen === "lexicon"} onClick={() => go("lexicon")} icon={<BookOpen size={19}/>} label="Lexique" />
          <NavButton active={screen === "profile"} onClick={() => go("profile")} icon={<Dog size={19}/>} label="Mon chien" />
        </nav>
        <div className="level-box"><small>NIVEAU ACTUEL</small><strong>Niveau {currentLevel}</strong><span>{completed}/{total} défis complétés</span></div>
      </aside>

      <section className="content">
        {selected ? <ChallengeDetail challenge={selected} onBack={() => setSelected(null)} />
        : screen === "home" ? <HomeScreen progress={progress} completed={completed} total={total} onChallenges={() => setScreen("challenges")} />
        : screen === "challenges" ? <ChallengesScreen grouped={grouped} onSelect={setSelected} />
        : screen === "weekly" ? <WeeklyScreen />
        : screen === "ranking" ? <RankingScreen />
        : screen === "lexicon" ? <LexiconScreen />
        : <ProfileScreen />}
      </section>
    </main>
  );
}

function NavButton({active, onClick, icon, label}: any) { return <button className={`nav-btn ${active ? "active" : ""}`} onClick={onClick}>{icon}<span>{label}</span></button>; }

function HomeScreen({progress, completed, total, onChallenges}: any) {
  return <>
    <section className="brand-hero">
      <img src="/detection-hero.webp" alt="Chien qui renifle un contenant d'odeur dans un salon, avec une femme heureuse en arrière-plan" />
      <div className="hero-overlay"><span className="hero-kicker">SENTEZ. CHERCHEZ. RÉUSSISSEZ.</span><h1>Détection d’odeurs Challenge</h1><p>Des défis progressifs pour développer l’autonomie, la précision et le plaisir de chercher avec votre chien.</p><button className="accent-button" onClick={onChallenges}>Commencer un défi</button></div>
    </section>
    <header className="dashboard-header"><p className="eyebrow">TABLEAU DE BORD</p><h2>Prêt pour une nouvelle recherche?</h2></header>
    <div className="grid">
      <article className="hero-card"><div><span className="pill">Niveau 1 · Débutant</span><h2>Progression</h2><div className="big-number">{progress}%</div><p>{completed} défis réussis sur {total}</p><div className="progress"><span style={{width: `${progress}%`}} /></div><button className="accent-button wide" onClick={onChallenges}>Voir mes défis</button></div></article>
      <article className="card weekly-card"><h3>Défi hebdomadaire</h3><p className="muted">3 recherches à compléter cette semaine.</p><div className="weekly-bars"><span/><span/><span/></div><p><strong>0 / 3</strong> recherche complétée</p></article>
      <article className="card"><h3>Prochain niveau</h3><p>Complète les 12 défis du niveau 1 pour débloquer le niveau 2.</p><div className="lock-box"><Lock size={24}/> Niveau 2 verrouillé</div></article>
      <article className="card"><h3>Catégories</h3><p>🏠 5 défis intérieur</p><p>🌲 5 défis extérieur</p><p>👥 2 défis en lieu public</p></article>
    </div>
  </>;
}

function ChallengesScreen({grouped, onSelect}: any) {
  return <><header><p className="eyebrow">NIVEAU 1</p><h1>Mes défis</h1><p>Complète toutes les catégories pour débloquer le niveau suivant.</p></header>
    {grouped.map((g: any) => <section key={g.category} className="category-section"><h2>{g.category}</h2><div className="challenge-grid">{g.items.map((c: Challenge) => <button className="challenge-card" key={c.id} onClick={() => onSelect(c)}><div className="challenge-top"><span className="number">{c.id}</span>{c.completed ? <CheckCircle2 size={20} className="done"/> : <span className="status">À faire</span>}</div><h3>{c.title}</h3><p>{c.description}</p><small>{formatDuration(c.duration)} max</small></button>)}</div></section>)}
  </>;
}

function ChallengeDetail({challenge, onBack}: {challenge: Challenge, onBack: () => void}) {
  const [result, setResult] = useState<"success" | "retry" | null>(null);
  return <><button className="back" onClick={onBack}>← Retour aux défis</button><div className="detail-card">
    <div className="detail-heading"><div><span className="pill">{challenge.category} · Niveau {challenge.level}</span><h1>{challenge.title}</h1></div><strong className="time-badge"><Clock3 size={18}/>{formatDuration(challenge.duration)}</strong></div>
    <p className="lead">{challenge.objective || challenge.description}</p>
    {challenge.materials && <DetailSection icon={<PackageCheck size={20}/>} title="Matériel"><ul className="detail-list">{challenge.materials.map(item => <li key={item}>{item}</li>)}</ul></DetailSection>}
    {challenge.installation && <DetailSection title="Installation"><ol className="numbered-list">{challenge.installation.map(item => <li key={item}>{item}</li>)}</ol></DetailSection>}
    {challenge.steps && <DetailSection title="Déroulement"><ol className="numbered-list">{challenge.steps.map(item => <li key={item}>{item}</li>)}</ol></DetailSection>}
    <div className="instruction-box"><h3>Critères de réussite</h3>{(challenge.successCriteria || ["Le chien identifie correctement la cache.", "La recherche est terminée avant la fin du temps."]).map(item => <p key={item}>✓ {item}</p>)}</div>
    <div className="timer-label">Chronomètre · maximum {formatDuration(challenge.duration)}</div><Timer seconds={challenge.duration} />
    <div className="result-actions"><button className="accent-button" onClick={() => setResult("success")}>✓ Défi réussi</button><button className="secondary" onClick={() => setResult("retry")}>À reprendre</button></div>
    {result && <div className={`result-message ${result}`}>{result === "success" ? "Bravo! Le défi est marqué comme réussi pour ce test." : "Pas de problème. Tu pourras reprendre ce défi quand tu veux."}<small> L'enregistrement permanent sera ajouté avec les comptes utilisateurs.</small></div>}
  </div></>;
}

function DetailSection({title, icon, children}: {title: string, icon?: React.ReactNode, children: React.ReactNode}) { return <section className="detail-section"><h3>{icon}{title}</h3>{children}</section>; }
function formatDuration(seconds: number) { const minutes = Math.floor(seconds / 60); const rest = seconds % 60; return rest ? `${minutes} min ${rest} s` : `${minutes} min`; }

function LexiconScreen() {
  const words = [["Source", "Endroit précis où se trouve l'odeur cible."],["Cache", "Emplacement choisi pour placer l'odeur ou la nourriture pendant l'exercice."],["Conducteur", "Personne qui accompagne le chien pendant la recherche."],["Marquer verbalement", "Utiliser un mot précis, par exemple « YES », pour indiquer au chien qu'il vient d'effectuer le comportement recherché."],["Leurrer", "Guider temporairement le chien avec une récompense, notamment pour l'éloigner de la source après la récompense."],["Odeur cible", "Odeur que le chien a appris à rechercher et à identifier."]];
  return <><header><p className="eyebrow">RÉFÉRENCE</p><h1>Lexique</h1><p>Les mots importants utilisés dans les défis de détection d'odeurs.</p></header><div className="lexicon-grid">{words.map(([word, definition]) => <article className="card" key={word}><h3>{word}</h3><p className="muted">{definition}</p></article>)}</div></>;
}

function WeeklyScreen() { return <><header><p className="eyebrow">CETTE SEMAINE</p><h1>Défi hebdomadaire · Niveau 1</h1><p>Complète trois recherches pour apparaître au classement.</p></header><div className="weekly-list">{["Recherche intérieure", "Recherche extérieure", "Recherche en environnement nouveau"].map((x, i) => <div className="weekly-item" key={x}><span className="number">{i+1}</span><div><h3>{x}</h3><p>Consignes à venir dans la version administrable.</p></div><button className="secondary">Commencer</button></div>)}</div></>; }
function RankingScreen() { const rows = [["1", "Marie & Nova", "285 pts"], ["2", "Julie & Pixel", "270 pts"], ["3", "Alex & Loki", "255 pts"], ["4", "Sophie & Milo", "230 pts"]]; return <><header><p className="eyebrow">NIVEAU 1</p><h1>Classement hebdomadaire</h1><p>Tu te mesures uniquement aux participants de ton niveau.</p></header><div className="ranking">{rows.map(r => <div className="rank-row" key={r[0]}><strong>#{r[0]}</strong><span>{r[1]}</span><b>{r[2]}</b></div>)}</div></>; }
function ProfileScreen() { return <><header><p className="eyebrow">PROFIL</p><h1>Mon chien</h1></header><div className="profile-card"><div className="dog-avatar">🐕</div><div><h2>Nova</h2><p>Border Collie · 3 ans</p><p>Niveau 1 · Débutant</p></div></div></>; }
