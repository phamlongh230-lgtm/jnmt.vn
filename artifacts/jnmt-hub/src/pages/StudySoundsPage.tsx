import { useState, useRef, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

interface SoundDef {
  key: string;
  icon: string;
  labelKey: string;
  // Web Audio API oscillator/noise config
  type: "noise" | "binaural" | "tone";
  freq?: number;
  freq2?: number;
  color?: "white" | "pink" | "brown";
}

const SOUNDS: SoundDef[] = [
  { key: "rain",    icon: "🌧️", labelKey: "sound_rain",    type: "noise", color: "pink" },
  { key: "cafe",    icon: "☕",  labelKey: "sound_cafe",    type: "noise", color: "brown" },
  { key: "forest",  icon: "🌲", labelKey: "sound_forest",  type: "noise", color: "pink" },
  { key: "white",   icon: "📻", labelKey: "sound_white",   type: "noise", color: "white" },
  { key: "lofi",    icon: "🎵", labelKey: "sound_lofi",    type: "tone",  freq: 174, freq2: 285 },
  { key: "ocean",   icon: "🌊", labelKey: "sound_ocean",   type: "binaural", freq: 8, freq2: 200 },
];

// Simple Web Audio noise generator
function createNoiseNode(ctx: AudioContext, color: "white" | "pink" | "brown", gain: GainNode) {
  const bufferSize = ctx.sampleRate * 4;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  if (color === "white") {
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  } else if (color === "pink") {
    let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
    for (let i = 0; i < bufferSize; i++) {
      const w = Math.random() * 2 - 1;
      b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759;
      b2=0.96900*b2+w*0.1538520; b3=0.86650*b3+w*0.3104856;
      b4=0.55000*b4+w*0.5329522; b5=-0.7616*b5-w*0.0168980;
      data[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)/7; b6=w*0.115926;
    }
  } else {
    let last = 0;
    for (let i = 0; i < bufferSize; i++) { last = (last + 0.02*(Math.random()*2-1))/1.02; data[i] = last*3.5; }
  }

  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  src.connect(gain);
  src.start();
  return src;
}

function createToneNode(ctx: AudioContext, freq: number, freq2: number, gain: GainNode) {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  osc1.type = "sine"; osc1.frequency.value = freq;
  osc2.type = "sine"; osc2.frequency.value = freq2;
  osc1.connect(gain); osc2.connect(gain);
  osc1.start(); osc2.start();
  return [osc1, osc2];
}

function createBinauralNode(ctx: AudioContext, beatFreq: number, baseFreq: number, gain: GainNode) {
  const merger = ctx.createChannelMerger(2);
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  osc1.frequency.value = baseFreq;
  osc2.frequency.value = baseFreq + beatFreq;
  osc1.connect(merger, 0, 0); osc2.connect(merger, 0, 1);
  merger.connect(gain);
  osc1.start(); osc2.start();
  return [osc1, osc2];
}

export default function StudySoundsPage() {
  const { isDark, lang } = useApp();
  const [active, setActive] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.4);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<AudioBufferSourceNode | OscillatorNode[]>([]);

  const border = isDark ? "#334155" : "#e2e8f0";
  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const text2 = isDark ? "#94a3b8" : "#64748b";

  const stop = () => {
    const nodes = nodesRef.current;
    if (Array.isArray(nodes)) {
      nodes.forEach(n => { try { n.stop(); } catch {} });
    } else if (nodes) {
      try { (nodes as AudioBufferSourceNode).stop(); } catch {}
    }
    nodesRef.current = [];
    setActive(null);
  };

  const play = (s: SoundDef) => {
    if (active === s.key) { stop(); return; }
    stop();
    const ctx = ctxRef.current || new AudioContext();
    ctxRef.current = ctx;
    if (ctx.state === "suspended") ctx.resume();
    const g = ctx.createGain();
    g.gain.value = volume;
    g.connect(ctx.destination);
    gainRef.current = g;

    if (s.type === "noise") {
      nodesRef.current = createNoiseNode(ctx, s.color!, g) as unknown as OscillatorNode[];
    } else if (s.type === "tone") {
      nodesRef.current = createToneNode(ctx, s.freq!, s.freq2!, g);
    } else {
      nodesRef.current = createBinauralNode(ctx, s.freq!, s.freq2!, g);
    }
    setActive(s.key);
  };

  useEffect(() => {
    if (gainRef.current) gainRef.current.gain.value = volume;
  }, [volume]);

  useEffect(() => () => stop(), []);

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "1.5rem 1rem" }} className="animate-fade-in">
      <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: textCol, marginBottom: "0.25rem" }}>🎵 {t(lang, "study_sounds")}</h2>
      <p style={{ fontSize: "0.82rem", color: text2, marginBottom: "1rem" }}>{t(lang, "study_sounds_desc")}</p>

      {/* Volume */}
      <div className="glass" style={{ borderRadius: 14, padding: "0.85rem 1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span style={{ fontSize: "0.82rem", color: text2, fontWeight: 600, whiteSpace: "nowrap" }}>🔊 {t(lang, "sound_volume")}</span>
        <input type="range" min={0} max={1} step={0.05} value={volume}
          onChange={e => setVolume(parseFloat(e.target.value))}
          style={{ flex: 1, accentColor: "#2563eb" }} />
        <span style={{ fontSize: "0.82rem", color: text2, fontWeight: 600, minWidth: 36, textAlign: "right" }}>{Math.round(volume * 100)}%</span>
      </div>

      {/* Sound grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        {SOUNDS.map(s => {
          const isPlaying = active === s.key;
          return (
            <button key={s.key} onClick={() => play(s)}
              style={{
                padding: "1.25rem 1rem",
                borderRadius: 16,
                border: `2px solid ${isPlaying ? "#2563eb" : border}`,
                background: isPlaying ? (isDark ? "#1e3a5f" : "#eff6ff") : (isDark ? "#1e293b" : "#fff"),
                cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem",
                transition: "all 0.15s",
                boxShadow: isPlaying ? "0 0 0 3px rgba(37,99,235,0.2)" : "none",
              }}>
              <span style={{ fontSize: "2rem" }}>{s.icon}</span>
              <span style={{ fontWeight: 700, color: isPlaying ? "#2563eb" : textCol, fontSize: "0.9rem" }}>{t(lang, s.labelKey)}</span>
              {isPlaying && (
                <span style={{ fontSize: "0.72rem", color: "#2563eb", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#2563eb", animation: "pulse 1s ease infinite" }} />
                  {t(lang, "sound_playing")}
                  <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {active && (
        <button onClick={stop}
          style={{ width: "100%", marginTop: "1rem", padding: "0.75rem", background: "#ef4444", color: "white", border: "none", borderRadius: 12, fontWeight: 700, cursor: "pointer", fontSize: "0.95rem" }}>
          ⏹ Stop
        </button>
      )}
    </div>
  );
}
