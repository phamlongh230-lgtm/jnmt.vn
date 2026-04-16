import { useState, useRef, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

interface Message {
  role: "user" | "assistant";
  content: string;
  time: string;
}

const SUGGESTIONS: Record<string, string[]> = {
  vi: [
    "Trường có những quy định gì về nội trú?",
    "Học tiếng Hàn cơ bản như thế nào?",
    "Cuộc sống ở Gangjin như thế nào?",
    "Các môn học trong trường là gì?",
  ],
  ko: [
    "기숙사 규칙이 어떻게 되나요?",
    "한국어 기초를 배우려면?",
    "강진에서의 생활은 어떤가요?",
    "학교 과목은 무엇인가요?",
  ],
  en: [
    "What are the dormitory rules?",
    "How to learn basic Korean?",
    "What is life like in Gangjin?",
    "What subjects are taught at school?",
  ],
  mn: [
    "Дотуур байрны дүрэм ямар вэ?",
    "Солонгос хэлийг хэрхэн суралцах вэ?",
    "Ганжин хотод амьдрал ямар байна вэ?",
    "Сургуульд ямар хичээл байдаг вэ?",
  ],
  kk: [
    "Жатақхана ережелері қандай?",
    "Корей тілін қалай үйренуге болады?",
    "Гангжинде өмір қалай?",
    "Мектепте қандай пәндер оқытылады?",
  ],
  ru: [
    "Каковы правила общежития?",
    "Как выучить базовый корейский?",
    "Какова жизнь в Канджине?",
    "Какие предметы преподают в школе?",
  ],
};

export default function AIChatPage() {
  const { lang, isDark } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const border = isDark ? "#334155" : "#e2e8f0";
  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const text2 = isDark ? "#94a3b8" : "#64748b";
  const cardBg = isDark ? "#1e293b" : "white";
  const inputBg = isDark ? "#0f172a" : "#f8fafc";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      role: "user",
      content: text.trim(),
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), history }),
      });

      const data = await res.json();

      const aiMsg: Message = {
        role: "assistant",
        content: data.reply || data.error || t(lang, "ai_sorry"),
        time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: t(lang, "ai_error_connection"), time: "" },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const suggestions = SUGGESTIONS[lang] || SUGGESTIONS.vi;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "1rem", height: "calc(100vh - 80px)", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)", borderRadius: "16px 16px 0 0", padding: "1rem 1.25rem", color: "white", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>
          🤖
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: "1rem" }}>JNMT AI Assistant</div>
          <div style={{ fontSize: "0.75rem", opacity: 0.85 }}>
            {lang === "ko" ? "학교 생활 AI 도우미" :
             lang === "en" ? "School Life AI Assistant" :
             lang === "mn" ? "Сургуулийн AI туслагч" :
             lang === "kk" ? "Мектеп AI көмекшісі" :
             lang === "ru" ? "ИИ-помощник по школьной жизни" :
             "Trợ lý AI hỗ trợ học đường"}
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", opacity: 0.85 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80" }} />
          Online
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", background: cardBg, border: `1px solid ${border}`, borderTop: "none", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>

        {/* Welcome */}
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "1.5rem 1rem" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🤖</div>
            <div style={{ fontWeight: 700, color: textCol, fontSize: "1rem", marginBottom: "0.4rem" }}>
              {lang === "ko" ? "안녕하세요! JNMT AI입니다" :
               lang === "en" ? "Hello! I'm JNMT AI" :
               lang === "mn" ? "Сайн байна уу! Би JNMT AI" :
               lang === "kk" ? "Сәлем! Мен JNMT AI" :
               lang === "ru" ? "Привет! Я JNMT AI" :
               "Xin chào! Tôi là JNMT AI"}
            </div>
            <div style={{ color: text2, fontSize: "0.85rem", marginBottom: "1.25rem" }}>
              {lang === "ko" ? "학교 생활, 한국어, 강진 생활에 대해 물어보세요!" :
               lang === "en" ? "Ask me about school life, Korean language, or life in Gangjin!" :
               lang === "mn" ? "Сургуулийн амьдрал, Солонгос хэл, Ганжин тухай асуугаарай!" :
               lang === "kk" ? "Мектеп өмірі, корей тілі немесе Гангжин туралы сұраңыз!" :
               lang === "ru" ? "Спрашивайте о школьной жизни, корейском языке или жизни в Канджине!" :
               "Hỏi tôi về trường học, tiếng Hàn, hay cuộc sống ở Gangjin nhé!"}
            </div>

            {/* Suggestions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: 480, margin: "0 auto" }}>
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => sendMessage(s)}
                  style={{ padding: "0.65rem 1rem", background: isDark ? "#0f172a" : "#f0f7ff", border: `1px solid ${isDark ? "#334155" : "#bfdbfe"}`, borderRadius: 10, cursor: "pointer", color: isDark ? "#93c5fd" : "#1d4ed8", fontSize: "0.85rem", textAlign: "left", transition: "background 0.15s" }}>
                  💬 {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat messages */}
        {messages.map((msg, idx) => (
          <div key={idx} style={{ display: "flex", flexDirection: msg.role === "user" ? "row-reverse" : "row", gap: "0.6rem", alignItems: "flex-end" }}>
            {msg.role === "assistant" && (
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>
                🤖
              </div>
            )}
            <div style={{ maxWidth: "75%" }}>
              <div style={{
                padding: "0.75rem 1rem",
                borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                background: msg.role === "user" ? "#2563eb" : (isDark ? "#0f172a" : "#f8fafc"),
                color: msg.role === "user" ? "white" : textCol,
                fontSize: "0.9rem",
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
                border: msg.role === "assistant" ? `1px solid ${border}` : "none",
              }}>
                {msg.content}
              </div>
              {msg.time && (
                <div style={{ fontSize: "0.7rem", color: text2, marginTop: "0.2rem", textAlign: msg.role === "user" ? "right" : "left" }}>
                  {msg.time}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", gap: "0.6rem", alignItems: "flex-end" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>🤖</div>
            <div style={{ padding: "0.75rem 1rem", background: isDark ? "#0f172a" : "#f8fafc", border: `1px solid ${border}`, borderRadius: "16px 16px 16px 4px", display: "flex", gap: "0.35rem", alignItems: "center" }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#7c3aed", animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ background: cardBg, border: `1px solid ${border}`, borderTop: "none", borderRadius: "0 0 16px 16px", padding: "0.75rem", display: "flex", gap: "0.6rem", alignItems: "flex-end" }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t(lang, "ai_message_ph")}
          rows={1}
          style={{ flex: 1, border: `1px solid ${border}`, borderRadius: 10, padding: "0.65rem 0.85rem", background: inputBg, color: textCol, fontSize: "0.9rem", resize: "none", outline: "none", fontFamily: "inherit", maxHeight: 120, overflowY: "auto" }}
          disabled={loading}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          style={{ width: 44, height: 44, borderRadius: 10, background: input.trim() && !loading ? "#2563eb" : (isDark ? "#334155" : "#e2e8f0"), border: "none", color: input.trim() && !loading ? "white" : text2, cursor: input.trim() && !loading ? "pointer" : "not-allowed", fontSize: "1.2rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.15s" }}>
          ➤
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
