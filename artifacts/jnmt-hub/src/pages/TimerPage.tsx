import { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

const PRESETS = [
  { label: "Pomodoro", study: 25, break: 5, longBreak: 15 },
  { label: "Tập trung sâu", study: 50, break: 10, longBreak: 30 },
  { label: "Ôn nhanh", study: 15, break: 3, longBreak: 10 },
];

type Phase = "study" | "break" | "longBreak";

export default function TimerPage() {
  const { isDark, lang } = useApp();
  const [studyMin, setStudyMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [longBreakMin, setLongBreakMin] = useState(15);
  const [phase, setPhase] = useState<Phase>("study");
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [rounds, setRounds] = useState(0);
  const [customStudy, setCustomStudy] = useState("25");
  const [customBreak, setCustomBreak] = useState("5");
  const [customLong, setCustomLong] = useState("15");
  const [activePreset, setActivePreset] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const border = isDark ? "#334155" : "#e2e8f0";
  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const text2 = isDark ? "#94a3b8" : "#64748b";
  const inputBg = isDark ? "#0f172a" : "#f8fafc";
  const trackColor = isDark ? "#334155" : "#e2e8f0";

  const phaseConfig: Record<Phase, { label: string; color: string; mins: number }> = {
    study:     { label: t(lang, "study_label"),  color: "#2563eb", mins: studyMin },
    break:     { label: t(lang, "break_label"),  color: "#10b981", mins: breakMin },
    longBreak: { label: "Nghỉ dài",              color: "#7c3aed", mins: longBreakMin },
  };

  const accent = phaseConfig[phase].color;

  useEffect(() => {
    setSeconds(phaseConfig[phase].mins * 60);
  }, [phase, studyMin, breakMin, longBreakMin]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            playBeep();
            setRunning(false);
            if (phase === "study") {
              const newRounds = rounds + 1;
              setRounds(newRounds);
              setPhase(newRounds % 4 === 0 ? "longBreak" : "break");
            } else {
              setPhase("study");
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, phase, rounds]);

  function playBeep() {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 880; osc.type = "sine";
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 1.5);
    } catch {}
  }

  function reset() { setRunning(false); setPhase("study"); setRounds(0); setSeconds(studyMin * 60); }

  function applyCustom() {
    const s = Math.max(1, Math.min(99, parseInt(customStudy) || 25));
    const b = Math.max(1, Math.min(99, parseInt(customBreak) || 5));
    const l = Math.max(1, Math.min(99, parseInt(customLong) || 15));
    setStudyMin(s); setBreakMin(b); setLongBreakMin(l);
    setRunning(false); setPhase("study"); setRounds(0); setSeconds(s * 60);
    setActivePreset(-1);
  }

  function applyPreset(idx: number) {
    const p = PRESETS[idx];
    setStudyMin(p.study); setBreakMin(p.break); setLongBreakMin(p.longBreak);
    setCustomStudy(String(p.study)); setCustomBreak(String(p.break)); setCustomLong(String(p.longBreak));
    setRunning(false); setPhase("study"); setRounds(0); setSeconds(p.study * 60);
    setActivePreset(idx);
  }

  const total = phaseConfig[phase].mins * 60;
  const progress = 1 - seconds / total;
  const circumference = 2 * Math.PI * 100;
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");

  // Pomodoro dots (4 per cycle)
  const dotsInCycle = rounds % 4;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem 1rem" }} className="animate-fade-in">

      {/* Presets */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.65rem", marginBottom: "1.25rem" }}>
        {PRESETS.map((p, i) => (
          <button key={p.label} onClick={() => applyPreset(i)}
            style={{ padding: "0.75rem", borderRadius: 14, border: `1.5px solid ${activePreset === i ? "#2563eb" : border}`, background: activePreset === i ? (isDark ? "#1e3a5f22" : "#eff6ff") : "transparent", cursor: "pointer", textAlign: "center", transition: "all 0.15s" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: activePreset === i ? "#2563eb" : textCol }}>{p.label}</div>
            <div style={{ fontSize: "0.72rem", color: text2, marginTop: "0.2rem" }}>{p.study}/{p.break}/{p.longBreak} phút</div>
          </button>
        ))}
      </div>

      {/* Phase tabs */}
      <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1.25rem", justifyContent: "center" }}>
        {(["study", "break", "longBreak"] as Phase[]).map(p => {
          const cfg = phaseConfig[p];
          const isActive = phase === p;
          return (
            <button key={p} onClick={() => { setRunning(false); setPhase(p); }}
              style={{ padding: "0.45rem 1rem", borderRadius: 100, border: `1.5px solid ${isActive ? cfg.color : border}`, background: isActive ? cfg.color : "transparent", color: isActive ? "white" : text2, cursor: "pointer", fontSize: "0.82rem", fontWeight: isActive ? 700 : 400, transition: "all 0.15s" }}>
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Timer ring */}
      <div className="glass" style={{ borderRadius: 22, padding: "2rem 1.5rem", textAlign: "center", marginBottom: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem", position: "relative" }}>
          <svg width={220} height={220} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={110} cy={110} r={100} fill="none" stroke={trackColor} strokeWidth={10} />
            <circle
              cx={110} cy={110} r={100} fill="none" stroke={accent} strokeWidth={10}
              strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)}
              strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", fontWeight: 900, color: textCol, fontVariantNumeric: "tabular-nums", letterSpacing: 2 }}>{mins}:{secs}</div>
            <div style={{ fontSize: "0.85rem", color: accent, marginTop: 4, fontWeight: 700 }}>{phaseConfig[phase].label}</div>
            {/* Pomodoro progress dots */}
            <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 8 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i < dotsInCycle ? accent : trackColor, transition: "background 0.3s" }} />
              ))}
            </div>
          </div>
        </div>

        <div style={{ fontSize: "0.78rem", color: text2, marginBottom: "1.25rem" }}>
          {t(lang, "rounds_completed")}: <strong style={{ color: accent }}>{rounds}</strong> {t(lang, "rounds_unit")}
          {rounds > 0 && ` · 🏆 ${Math.floor(rounds / 4)} chu kỳ hoàn thành`}
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={() => setRunning(r => !r)}
            style={{ padding: "0.85rem 2.5rem", background: accent, color: "white", border: "none", borderRadius: 12, fontSize: "1rem", fontWeight: 700, cursor: "pointer", transition: "opacity 0.15s" }}>
            {running ? `⏸ ${t(lang, "pause")}` : seconds === 0 ? `▶ ${t(lang, "start_new")}` : `▶ ${t(lang, "start")}`}
          </button>
          <button onClick={reset}
            style={{ padding: "0.85rem 1.25rem", background: isDark ? "#334155" : "#f1f5f9", color: textCol, border: "none", borderRadius: 12, fontSize: "0.9rem", fontWeight: 600, cursor: "pointer" }}>
            Reset
          </button>
        </div>
      </div>

      {/* Custom time */}
      <div className="glass" style={{ borderRadius: 22, padding: "1.25rem" }}>
        <p style={{ color: textCol, fontSize: "0.9rem", fontWeight: 600, margin: "0 0 1rem" }}>⚙️ {t(lang, "customize_time")}</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.65rem", marginBottom: "0.75rem" }}>
          {[
            { label: t(lang, "study_minutes"), val: customStudy, set: setCustomStudy },
            { label: t(lang, "break_minutes"), val: customBreak, set: setCustomBreak },
            { label: "Nghỉ dài (phút)", val: customLong, set: setCustomLong },
          ].map(({ label, val, set }) => (
            <div key={label}>
              <label style={{ color: text2, fontSize: "0.72rem", display: "block", marginBottom: 4 }}>{label}</label>
              <input type="number" value={val} onChange={e => set(e.target.value)} min={1} max={99}
                style={{ width: "100%", padding: "0.65rem", borderRadius: 8, border: `1px solid ${border}`, background: inputBg, color: textCol, fontSize: "1.1rem", outline: "none", boxSizing: "border-box", textAlign: "center", fontWeight: 700 }} />
            </div>
          ))}
        </div>
        <button onClick={applyCustom} style={{ width: "100%", padding: "0.7rem", background: "#2563eb", color: "white", border: "none", borderRadius: 8, fontSize: "0.9rem", fontWeight: 700, cursor: "pointer" }}>
          {t(lang, "apply")}
        </button>
      </div>
    </div>
  );
}
