import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { t, LANGUAGES } from "@/lib/i18n";
import { useTranslateText } from "@workspace/api-client-react";

export default function DictionaryPage() {
  const { lang, isDark } = useApp();
  const [text, setText] = useState("");
  const [sourceLang, setSourceLang] = useState("vi");
  const [targetLang, setTargetLang] = useState("en");
  const [result, setResult] = useState<{ originalText: string; translatedText: string } | null>(null);
  const [error, setError] = useState("");

  const border = isDark ? "#334155" : "#e2e8f0";
  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const text2 = isDark ? "#94a3b8" : "#64748b";
  const inputBg = isDark ? "#1e293b" : "#f8fafc";
  const cardBg = isDark ? "#1e293b" : "white";

  const translateMutation = useTranslateText({
    mutation: {
      onSuccess: (data) => {
        setResult({ originalText: data.originalText, translatedText: data.translatedText });
        setError("");
      },
      onError: () => {
        setError("Lỗi kết nối dịch thuật. Vui lòng thử lại!");
        setResult(null);
      },
    },
  });

  const handleTranslate = () => {
    if (!text.trim()) return;
    translateMutation.mutate({ data: { text: text.trim(), sourceLang, targetLang } });
  };

  const swapLangs = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    if (result) {
      setText(result.translatedText);
      setResult(null);
    }
  };

  const getLangName = (code: string) => {
    return LANGUAGES.find((l) => l.code === code)?.name || code;
  };
  const getLangFlag = (code: string) => {
    return LANGUAGES.find((l) => l.code === code)?.flag || "🌐";
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem 1rem" }} className="animate-fade-in">
      <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 16, padding: "1.5rem" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#2563eb", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            📖 {t(lang, "dictionary")}
          </h2>
          <p style={{ color: text2, fontSize: "0.9rem", marginTop: "0.25rem" }}>Dịch giữa 6 ngôn ngữ</p>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nhập văn bản để dịch..."
          rows={4}
          style={{ width: "100%", padding: "0.85rem", border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: textCol, fontSize: "1rem", resize: "vertical", marginBottom: "1rem", outline: "none" }}
          onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) handleTranslate(); }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            style={{ flex: 1, minWidth: 130, padding: "0.6rem", border: `1px solid ${border}`, borderRadius: 8, background: inputBg, color: textCol, fontSize: "0.9rem" }}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
            ))}
          </select>

          <button
            onClick={swapLangs}
            style={{ padding: "0.6rem 0.9rem", background: "#eff6ff", border: `1px solid #bfdbfe`, borderRadius: 8, cursor: "pointer", fontSize: "1rem", color: "#2563eb", transition: "background 0.15s" }}
            title="Đổi ngôn ngữ"
          >
            ⇄
          </button>

          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            style={{ flex: 1, minWidth: 130, padding: "0.6rem", border: `1px solid ${border}`, borderRadius: 8, background: inputBg, color: textCol, fontSize: "0.9rem" }}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
            ))}
          </select>

          <button
            onClick={handleTranslate}
            disabled={translateMutation.isPending || !text.trim()}
            style={{ padding: "0.6rem 1.5rem", background: "#2563eb", color: "white", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: "0.9rem", opacity: (translateMutation.isPending || !text.trim()) ? 0.6 : 1, transition: "opacity 0.15s" }}
          >
            {translateMutation.isPending ? "..." : t(lang, "translate")}
          </button>
        </div>

        {error && (
          <div style={{ background: "#fef2f2", color: "#ef4444", padding: "0.8rem", borderRadius: 8, marginBottom: "1rem", fontSize: "0.9rem" }}>
            ❌ {error}
          </div>
        )}

        {result && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", animation: "fadeIn 0.3s ease" }}>
            <div style={{ padding: "1rem", background: isDark ? "#0f172a" : "#f8fafc", borderRadius: 10, borderLeft: "4px solid #2563eb" }}>
              <div style={{ color: text2, fontSize: "0.8rem", marginBottom: "0.5rem", fontWeight: 600 }}>
                {getLangFlag(sourceLang)} {getLangName(sourceLang)}
              </div>
              <div style={{ color: textCol, fontSize: "1rem", fontWeight: 600, whiteSpace: "pre-wrap" }}>{result.originalText}</div>
            </div>
            <div style={{ padding: "1rem", background: isDark ? "#0f172a" : "#f0fdf4", borderRadius: 10, borderLeft: "4px solid #10b981" }}>
              <div style={{ color: text2, fontSize: "0.8rem", marginBottom: "0.5rem", fontWeight: 600 }}>
                {getLangFlag(targetLang)} {getLangName(targetLang)}
              </div>
              <div style={{ color: "#10b981", fontSize: "1rem", fontWeight: 600, whiteSpace: "pre-wrap" }}>{result.translatedText}</div>
            </div>
          </div>
        )}

        {!result && !error && (
          <div style={{ color: text2, textAlign: "center", padding: "2rem", fontSize: "0.9rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🌍</div>
            Nhập văn bản và nhấn Dịch (hoặc Ctrl+Enter)
          </div>
        )}
      </div>
    </div>
  );
}
