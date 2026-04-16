import { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

export default function TimerPage() {
  const { isDark, lang } = useApp();
  const [studyMin, setStudyMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [isStudy, setIsStudy] = useState(true);
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [rounds, setRounds] = useState(0);
  const [customStudy, setCustomStudy] = useState("25");
  const [customBreak, setCustomBreak] = useState("5");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const border = isDark ? "#334155" : "#e2e8f0";
  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const text2 = isDark ? "#94a3b8" : "#64748b";
  const cardBg = isDark ? "#1e293b" : "white";
  const inputBg = isDark ? "#0f172a" : "#f8fafc";
  const trackColor = isDark ? "#334155" : "#e2e8f0";
  const accent = isStudy ? "#2563eb" : "#10b981";

  useEffect(() => {
    setSeconds((isStudy ? studyMin : breakMin) * 60);
  }, [isStudy, studyMin, breakMin]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            playBeep();
            setRunning(false);
            if (isStudy) { setRounds(r => r + 1); setIsStudy(false); }
            else setIsStudy(true);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, isStudy]);

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

  function reset() { setRunning(false); setIsStudy(true); setSeconds(studyMin * 60); }

  function applyCustom() {
    const s = Math.max(1, Math.min(99, parseInt(customStudy) || 25));
    const b = Math.max(1, Math.min(99, parseInt(customBreak) || 5));
    setStudyMin(s); setBreakMin(b); setRunning(false); setIsStudy(true); setSeconds(s * 60);
  }

  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  const total = (isStudy ? studyMin : breakMin) * 60;
  const progress = 1 - seconds / total;
  const circumference = 2 * Math.PI * 100;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem 1rem" }} className="animate-fade-in">
      <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
          ⏱️ Pomodoro Timer
        </h2>
        <p style={{ color: text2, fontSize: "0.9rem", marginTop: "0.25rem" }}>
          {isStudy ? t(lang, "study_phase") : t(lang, "break_phase")} · {t(lang, "rounds_completed")}: <strong style={{ color: "#2563eb" }}>{rounds}</strong> {t(lang, "rounds_unit")}
        </p>
      </div>

      <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 20, padding: "2rem 1.5rem", textAlign: "center", marginBottom: "1rem" }}>
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
            <div style={{ fontSize: "0.85rem", color: text2, marginTop: 4, fontWeight: 600 }}>{isStudy ? "HỌC" : "NGHỈ"}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={() => setRunning(r => !r)}
            style={{ padding: "0.85rem 2.5rem", background: accent, color: "white", border: "none", borderRadius: 12, fontSize: "1rem", fontWeight: 700, cursor: "pointer" }}>
            {running ? "⏸ Tạm dừng" : seconds === 0 ? "▶ Bắt đầu mới" : "▶ Bắt đầu"}
          </button>
          <button onClick={reset}
            style={{ padding: "0.85rem 1.25rem", background: isDark ? "#334155" : "#f1f5f9", color: textCol, border: "none", borderRadius: 12, fontSize: "0.9rem", fontWeight: 600, cursor: "pointer" }}>
            Reset
          </button>
        </div>
      </div>

      <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 16, padding: "1.25rem" }}>
        <p style={{ color: textCol, fontSize: "0.9rem", fontWeight: 600, margin: "0 0 1rem" }}>⚙️ Tùy chỉnh thời gian</p>
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <div style={{ flex: 1 }}>
            <label style={{ color: text2, fontSize: "0.78rem", display: "block", marginBottom: 4 }}>Học (phút)</label>
            <input type="number" value={customStudy} onChange={e => setCustomStudy(e.target.value)} min={1} max={99}
              style={{ width: "100%", padding: "0.65rem", borderRadius: 8, border: `1px solid ${border}`, background: inputBg, color: textCol, fontSize: "1.1rem", outline: "none", boxSizing: "border-box", textAlign: "center", fontWeight: 700 }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ color: text2, fontSize: "0.78rem", display: "block", marginBottom: 4 }}>Nghỉ (phút)</label>
            <input type="number" value={customBreak} onChange={e => setCustomBreak(e.target.value)} min={1} max={99}
              style={{ width: "100%", padding: "0.65rem", borderRadius: 8, border: `1px solid ${border}`, background: inputBg, color: textCol, fontSize: "1.1rem", outline: "none", boxSizing: "border-box", textAlign: "center", fontWeight: 700 }} />
          </div>
        </div>
        <button onClick={applyCustom} style={{ width: "100%", padding: "0.7rem", background: "#2563eb", color: "white", border: "none", borderRadius: 8, fontSize: "0.9rem", fontWeight: 700, cursor: "pointer" }}>
          Áp dụng
        </button>
      </div>
    </div>
  );
}
