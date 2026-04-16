import { useState, useEffect, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { t, LANGUAGES } from "@/lib/i18n";

export default function DictionaryPage() {
  const { lang, isDark } = useApp();
  const [text, setText] = useState("");
  const [sourceLang, setSourceLang] = useState("vi");
  const [targetLang, setTargetLang] = useState("ko");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const border = isDark ? "#334155" : "#e2e8f0";
  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const text2 = isDark ? "#94a3b8" : "#64748b";
  const inputBg = isDark ? "#1e293b" : "#f8fafc";

  const doTranslate = useCallback(async (q: string, sl: string, tl: string) => {
    if (!q.trim()) return;
    if (sl === tl) { setResult(q); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: q.trim(), sourceLang: sl, targetLang: tl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi");
      setResult(data.translatedText);
    } catch {
      setError(t(lang, "error_translation"));
      setResult("");
    } finally {
      setLoading(false);
    }
  }, [lang]);

  // Tự động dịch sau 600ms ngừng gõ
  useEffect(() => {
    if (!text.trim()) { setResult(""); setError(""); return; }
    const timer = setTimeout(() => doTranslate(text, sourceLang, targetLang), 600);
    return () => clearTimeout(timer);
  }, [text, sourceLang, targetLang, doTranslate]);

  const swapLangs = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setText(result || text);
    setResult("");
  };

  const getLangFlag = (code: string) => LANGUAGES.find((l) => l.code === code)?.flag || "🌐";
  const getLangName = (code: string) => LANGUAGES.find((l) => l.code === code)?.name || code;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem 1rem" }}>
      <div className="glass" style={{ borderRadius: 22, overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: `1px solid ${border}` }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#2563eb", margin: 0 }}>
            📖 {t(lang, "dictionary")}
          </h2>
          <p style={{ color: text2, fontSize: "0.82rem", margin: "0.25rem 0 0" }}>
            {t(lang, "dict_subtitle")}
          </p>
        </div>

        {/* Lang selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.5rem", borderBottom: `1px solid ${border}` }}>
          <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)}
            style={{ flex: 1, padding: "0.55rem", border: `1px solid ${border}`, borderRadius: 8, background: inputBg, color: textCol, fontSize: "0.9rem", fontWeight: 600 }}>
            {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
          </select>

          <button onClick={swapLangs}
            style={{ padding: "0.55rem 1rem", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, cursor: "pointer", fontSize: "1.1rem", color: "#2563eb", fontWeight: 700 }}>
            ⇄
          </button>

          <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)}
            style={{ flex: 1, padding: "0.55rem", border: `1px solid ${border}`, borderRadius: 8, background: inputBg, color: textCol, fontSize: "0.9rem", fontWeight: 600 }}>
            {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
          </select>
        </div>

        {/* Input + Output */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 220 }}>
          {/* Input */}
          <div style={{ borderRight: `1px solid ${border}`, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "0.5rem 1rem", borderBottom: `1px solid ${border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.78rem", color: text2, fontWeight: 600 }}>{getLangFlag(sourceLang)} {getLangName(sourceLang)}</span>
              {text && <button onClick={() => { setText(""); setResult(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: text2 }}>✕</button>}
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t(lang, "translate_input_ph")}
              style={{ flex: 1, border: "none", outline: "none", resize: "none", background: "transparent", color: textCol, fontSize: "1rem", padding: "1rem", fontFamily: "inherit", lineHeight: 1.6 }}
            />
            <div style={{ padding: "0.4rem 1rem", fontSize: "0.72rem", color: text2, borderTop: `1px solid ${border}` }}>
              {text.length} {t(lang, "chars_suffix")}
            </div>
          </div>

          {/* Output */}
          <div style={{ display: "flex", flexDirection: "column", background: isDark ? "#0f172a" : "#f8fafc" }}>
            <div style={{ padding: "0.5rem 1rem", borderBottom: `1px solid ${border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.78rem", color: text2, fontWeight: 600 }}>{getLangFlag(targetLang)} {getLangName(targetLang)}</span>
              {result && (
                <button onClick={() => navigator.clipboard.writeText(result)} title={t(lang, "copy_btn")}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#2563eb", fontSize: "0.85rem" }}>📋</button>
              )}
            </div>
            <div style={{ flex: 1, padding: "1rem", display: "flex", alignItems: loading ? "center" : "flex-start" }}>
              {loading && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: text2, fontSize: "0.9rem" }}>
                  <div style={{ width: 16, height: 16, border: "2px solid #e2e8f0", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                  {t(lang, "translating")}
                </div>
              )}
              {error && !loading && <div style={{ color: "#ef4444", fontSize: "0.9rem" }}>❌ {error}</div>}
              {result && !loading && (
                <div style={{ color: "#10b981", fontSize: "1rem", fontWeight: 600, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{result}</div>
              )}
              {!text && !loading && !result && (
                <div style={{ color: text2, fontSize: "0.9rem", textAlign: "center", width: "100%", marginTop: "1rem" }}>🌍 {t(lang, "translation_empty")}</div>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
