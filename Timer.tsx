"use client";

import { useEffect, useState } from "react";

export default function Timer({ seconds = 180 }: { seconds?: number }) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || remaining <= 0) return;
    const id = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(id);
  }, [running, remaining]);

  const minutes = Math.floor(remaining / 60).toString().padStart(2, "0");
  const secs = (remaining % 60).toString().padStart(2, "0");

  return (
    <div className="timer-card">
      <div className="timer">{minutes}:{secs}</div>
      <div className="button-row">
        <button className="primary" onClick={() => setRunning((v) => !v)}>
          {running ? "Pause" : "Démarrer"}
        </button>
        <button className="secondary" onClick={() => { setRunning(false); setRemaining(seconds); }}>
          Recommencer
        </button>
      </div>
    </div>
  );
}
