import { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { t, LANGUAGES } from "@/lib/i18n";

interface SubtitleMsg {
  type: "transcript";
  original: string;
  translated: string;
  lang: string;
}

export default function SubtitlePage() {
  const { isDark, lang } = useApp();
  const [roomId, setRoomId] = useState("");
  const [targetLang, setTargetLang] = useState("vi");
  const [connected, setConnected] = useState(false);
  const [subtitles, setSubtitles] = useState<SubtitleMsg[]>([]);
  const [status, setStatus] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const border = isDark ? "#334155" : "#e2e8f0";
  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const text2 = isDark ? "#94a3b8" : "#64748b";
  const cardBg = isDark ? "#1e293b" : "white";
  const inputBg = isDark ? "#0f172a" : "#f8fafc";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [subtitles]);

  function connect() {
    if (!roomId.trim()) { setStatus(t(lang, "enter_room_code")); return; }
    const wsUrl = window.location.origin.replace(/^https/, "wss").replace(/^http/, "ws") + "/ws/room/" + roomId.toUpperCase();
    const ws = new WebSocket(wsUrl);
    ws.onopen = () => { setConnected(true); setStatus(t(lang, "connected_waiting_teacher")); };
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data) as SubtitleMsg;
        if (msg.type === "transcript") setSubtitles(prev => [...prev.slice(-50), msg]);
      } catch {}
    };
    ws.onclose = () => { setConnected(false); setStatus(t(lang, "disconnected_msg")); };
    ws.onerror = () => setStatus(t(lang, "connection_error"));
    wsRef.current = ws;
  }

  function disconnect() {
    wsRef.current?.close();
    wsRef.current = null;
    setConnected(false);
    setStatus("");
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem 1rem" }} className="animate-fade-in">
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#2563eb", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          📝 {t(lang, "subtitle_title")}
        </h2>
        <p style={{ color: text2, fontSize: "0.9rem", marginTop: "0.25rem" }}>{t(lang, "subtitle_desc")}</p>
      </div>

      {!connected ? (
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 16, padding: "1.5rem" }}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ color: textCol, fontSize: "0.9rem", fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>
              {t(lang, "room_code")}
            </label>
            <input
              value={roomId}
              onChange={e => setRoomId(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="VD: ABC123"
              maxLength={6}
              style={{
                width: "100%", padding: "0.75rem 1rem", borderRadius: 10, boxSizing: "border-box",
                border: `1.5px solid ${border}`, background: inputBg, color: textCol,
                fontSize: "1.25rem", fontWeight: 700, letterSpacing: 6, outline: "none",
              }}
            />
          </div>
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ color: textCol, fontSize: "0.9rem", fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>
              {t(lang, "select_lang")}
            </label>
            <select
              value={targetLang}
              onChange={e => setTargetLang(e.target.value)}
              style={{ width: "100%", padding: "0.65rem 0.85rem", border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: textCol, fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
            >
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
            </select>
          </div>
          {status && <p style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: "0.75rem" }}>{status}</p>}
          <button
            onClick={connect}
            style={{ width: "100%", padding: "0.85rem", background: "#2563eb", color: "white", border: "none", borderRadius: 10, fontSize: "1rem", fontWeight: 700, cursor: "pointer" }}
          >
            🔌 {t(lang, "connect")}
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 16, padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <span style={{ color: "#10b981", fontWeight: 700, fontSize: "0.9rem" }}>● Phòng: {roomId}</span>
              <p style={{ color: text2, fontSize: "0.8rem", margin: "2px 0 0" }}>{status}</p>
            </div>
            <button
              onClick={disconnect}
              style={{ padding: "0.5rem 1rem", background: "#ef4444", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 }}
            >
              {t(lang, "disconnect")}
            </button>
          </div>

          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 16, padding: "1.25rem", minHeight: 300, maxHeight: 460, overflowY: "auto" }}>
            {subtitles.length === 0 ? (
              <div style={{ textAlign: "center", color: text2, paddingTop: 60 }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>👂</div>
                <p style={{ fontWeight: 600 }}>{t(lang, "waiting_subtitle")}</p>
                <p style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>{t(lang, "teacher_speaking_hint")}</p>
              </div>
            ) : (
              subtitles.map((s, i) => (
                <div key={i} style={{ marginBottom: "1rem", borderBottom: `1px solid ${border}`, paddingBottom: "0.85rem" }}>
                  <p style={{ color: text2, fontSize: "0.78rem", margin: "0 0 4px", fontWeight: 600 }}>{t(lang, "teacher_label")}:</p>
                  <p style={{ color: textCol, fontSize: "0.95rem", margin: "0 0 6px", fontStyle: "italic" }}>{s.original}</p>
                  <p style={{ color: "#2563eb", fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>{s.translated}</p>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>
        </div>
      )}
    </div>
  );
}
