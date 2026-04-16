import { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { t, LANGUAGES } from "@/lib/i18n";

interface ChatMsg {
  id: string;
  original: string;
  translated: string;
  fromLang: string;
  toLang: string;
  isMine: boolean;
  timestamp: number;
}

interface SpeechRecognitionResult {
  readonly transcript: string;
}
interface SpeechRecognitionResultList {
  readonly [index: number]: readonly SpeechRecognitionResult[] & { [key: number]: SpeechRecognitionResult };
}
interface SpeechRecognitionEvent {
  readonly results: SpeechRecognitionResultList;
}
interface ISpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function ConversationPage() {
  const { isDark, lang } = useApp();
  const [roomId, setRoomId] = useState("");
  const [myLang, setMyLang] = useState("vi");
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState("");
  const [mode, setMode] = useState<"create" | "join">("create");
  const wsRef = useRef<WebSocket | null>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const border = isDark ? "#334155" : "#e2e8f0";
  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const text2 = isDark ? "#94a3b8" : "#64748b";
  const inputBg = isDark ? "#0f172a" : "#f8fafc";

  const hasSpeechRecognition = !!(
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function translateText(text: string, from: string, to: string): Promise<string> {
    try {
      const resp = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, sourceLang: from, targetLang: to }),
      });
      const data = (await resp.json()) as { translatedText: string };
      return data.translatedText || text;
    } catch { return text; }
  }

  function connect(room: string) {
    const wsUrl = window.location.origin.replace(/^https/, "wss").replace(/^http/, "ws") + "/ws/room/" + room;
    const ws = new WebSocket(wsUrl);
    ws.onopen = () => { setConnected(true); setStatus(t(lang, "waiting_partner")); };
    ws.onmessage = async (e: MessageEvent) => {
      try {
        const msg = JSON.parse(e.data) as { type: string; original: string; fromLang: string; id: string; timestamp: number };
        if (msg.type === "chat") {
          const translated = await translateText(msg.original, msg.fromLang, myLang);
          setMessages(prev => [...prev, { id: msg.id, original: msg.original, translated, fromLang: msg.fromLang, toLang: myLang, isMine: false, timestamp: msg.timestamp }]);
          if (window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(translated);
            utterance.lang = myLang === "vi" ? "vi-VN" : myLang === "ko" ? "ko-KR" : myLang;
            window.speechSynthesis.speak(utterance);
          }
        }
      } catch {}
    };
    ws.onclose = () => { setConnected(false); setStatus(t(lang, "disconnected_msg")); };
    ws.onerror = () => setStatus(t(lang, "connection_error"));
    wsRef.current = ws;
  }

  function handleCreate() { const code = generateRoomCode(); setRoomId(code); connect(code); }
  function handleJoin() { if (!roomId.trim()) { setStatus(t(lang, "enter_room_code")); return; } connect(roomId.toUpperCase()); }

  function disconnect() {
    recognitionRef.current?.stop();
    wsRef.current?.close();
    wsRef.current = null;
    setConnected(false); setListening(false); setStatus(""); setMessages([]); setRoomId("");
  }

  async function sendText(text: string) {
    if (!text.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    const id = Date.now().toString();
    const otherLang = myLang === "vi" ? "ko" : "vi";
    const translated = await translateText(text, myLang, otherLang);
    setMessages(prev => [...prev, { id, original: text, translated, fromLang: myLang, toLang: otherLang, isMine: true, timestamp: Date.now() }]);
    wsRef.current.send(JSON.stringify({ type: "chat", original: text, fromLang: myLang, id, timestamp: Date.now() }));
  }

  function toggleListening() {
    if (!hasSpeechRecognition) { setStatus("Trình duyệt không hỗ trợ nhận giọng nói"); return; }
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = myLang === "vi" ? "vi-VN" : myLang === "ko" ? "ko-KR" : myLang;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (e: SpeechRecognitionEvent) => sendText(e.results[0][0].transcript);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => { setListening(false); setStatus(t(lang, "speech_error")); };
    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem 1rem" }} className="animate-fade-in">
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#2563eb", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          🎙️ Hội thoại 1:1
        </h2>
        <p style={{ color: text2, fontSize: "0.9rem", marginTop: "0.25rem" }}>Nói chuyện với dịch thuật real-time qua WebSocket</p>
      </div>

      {!connected ? (
        <div className="glass" style={{ borderRadius: 22, padding: "1.5rem" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: "1.25rem" }}>
            {(["create", "join"] as const).map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: "0.65rem", borderRadius: 10, fontWeight: 600, fontSize: "0.9rem", cursor: "pointer",
                border: `2px solid ${mode === m ? "#2563eb" : border}`,
                background: mode === m ? "#2563eb" : "transparent", color: mode === m ? "white" : textCol,
              }}>
                {m === "create" ? t(lang, "create_room_btn") : t(lang, "join_room_btn")}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ color: textCol, fontSize: "0.9rem", fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>{t(lang, "your_lang")}</label>
            <select value={myLang} onChange={e => setMyLang(e.target.value)}
              style={{ width: "100%", padding: "0.65rem 0.85rem", border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: textCol, fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}>
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
            </select>
          </div>

          {mode === "join" && (
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ color: textCol, fontSize: "0.9rem", fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>{t(lang, "room_code")}</label>
              <input value={roomId} onChange={e => setRoomId(e.target.value.toUpperCase().slice(0, 6))} placeholder="ABC123" maxLength={6}
                style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: 10, border: `1.5px solid ${border}`, background: inputBg, color: textCol, fontSize: "1.25rem", fontWeight: 700, letterSpacing: 6, outline: "none", boxSizing: "border-box" }} />
            </div>
          )}

          {status && <p style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: "0.75rem" }}>{status}</p>}
          <button onClick={mode === "create" ? handleCreate : handleJoin}
            style={{ width: "100%", padding: "0.85rem", background: "#2563eb", color: "white", border: "none", borderRadius: 10, fontSize: "1rem", fontWeight: 700, cursor: "pointer" }}>
            {mode === "create" ? `🚀 ${t(lang, "create_connect_btn")}` : `🔌 ${t(lang, "join_connect_btn")}`}
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="glass" style={{ borderRadius: 22, padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <span style={{ color: "#10b981", fontWeight: 700, fontSize: "0.9rem" }}>● Phòng: {roomId}</span>
              <p style={{ color: text2, fontSize: "0.8rem", margin: "2px 0 0" }}>{status}</p>
            </div>
            <button onClick={disconnect} style={{ padding: "0.5rem 1rem", background: "#ef4444", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 }}>{t(lang, "disconnect")}</button>
          </div>

          <div className="glass" style={{ borderRadius: 22, padding: "1.25rem", minHeight: 280, maxHeight: 400, overflowY: "auto" }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: "center", color: text2, paddingTop: 60 }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🎤</div>
                <p style={{ fontWeight: 600 }}>{t(lang, "mic_prompt")}</p>
              </div>
            ) : (
              messages.map(m => (
                <div key={m.id} style={{ marginBottom: "0.85rem", display: "flex", flexDirection: "column", alignItems: m.isMine ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "75%", background: m.isMine ? "#2563eb" : (isDark ? "#0f172a" : "#f8fafc"), borderRadius: m.isMine ? "12px 12px 4px 12px" : "12px 12px 12px 4px", padding: "0.6rem 0.9rem", border: m.isMine ? "none" : `1px solid ${border}` }}>
                    <p style={{ color: m.isMine ? "rgba(255,255,255,0.7)" : text2, fontSize: "0.78rem", margin: "0 0 3px", fontStyle: "italic" }}>{m.original}</p>
                    <p style={{ color: m.isMine ? "white" : textCol, fontSize: "0.95rem", fontWeight: 600, margin: 0 }}>{m.translated}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          <button onClick={toggleListening}
            style={{ width: "100%", padding: "1rem", borderRadius: 12, border: "none", background: listening ? "#ef4444" : "#2563eb", color: "white", fontSize: "1rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {listening ? `🔴 ${t(lang, "listening_label")}` : `🎤 ${t(lang, "speak_btn")}`}
          </button>
          {!hasSpeechRecognition && <p style={{ color: "#ef4444", fontSize: "0.82rem", textAlign: "center" }}>{t(lang, "no_speech_support")}</p>}
        </div>
      )}
    </div>
  );
}
