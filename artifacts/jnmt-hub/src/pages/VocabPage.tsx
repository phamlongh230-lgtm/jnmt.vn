import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { t, LANGUAGES } from "@/lib/i18n";

interface VocabItem {
  id: string;
  word: string;
  meaning: string;
  example: string;
  lang: string;
}

const LANG_FILTER_CODES = [{ code: "all", flag: "🌐" }, ...LANGUAGES.map((l) => ({ code: l.code, flag: l.flag }))];

export default function VocabPage() {
  const { isDark, lang } = useApp();
  const [items, setItems] = useState<VocabItem[]>([]);
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [example, setExample] = useState("");
  const [wordLang, setWordLang] = useState("ko");
  const [filterLang, setFilterLang] = useState("all");
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewFlipped, setReviewFlipped] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const border = isDark ? "#334155" : "#e2e8f0";
  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const text2 = isDark ? "#94a3b8" : "#64748b";
  const cardBg = isDark ? "#1e293b" : "white";
  const inputBg = isDark ? "#0f172a" : "#f8fafc";

  useEffect(() => {
    const saved = localStorage.getItem("jnmt_vocab");
    if (saved) setItems(JSON.parse(saved));
  }, []);

  function save(newItems: VocabItem[]) {
    setItems(newItems);
    localStorage.setItem("jnmt_vocab", JSON.stringify(newItems));
  }

  function addWord() {
    if (!word.trim() || !meaning.trim()) return;
    save([{ id: Date.now().toString(), word, meaning, example, lang: wordLang }, ...items]);
    setWord(""); setMeaning(""); setExample(""); setShowAdd(false);
  }

  const filtered = items.filter(i => filterLang === "all" || i.lang === filterLang);

  // Get display name for a language filter button
  const filterName = (code: string) => {
    if (code === "all") return t(lang, "all_langs");
    return LANGUAGES.find((l) => l.code === code)?.name || code;
  };

  if (reviewMode && filtered.length > 0) {
    const item = filtered[reviewIndex % filtered.length];
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem 1rem" }} className="animate-fade-in">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
          <button onClick={() => { setReviewMode(false); setReviewFlipped(false); setReviewIndex(0); }}
            style={{ background: "none", border: "none", color: "#2563eb", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer" }}>
            ← {t(lang, "go_back")}
          </button>
          <h2 style={{ color: "#2563eb", fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>
            🧠 {t(lang, "review_mode")} ({reviewIndex + 1}/{filtered.length})
          </h2>
        </div>

        <div
          onClick={() => setReviewFlipped(f => !f)}
          style={{
            background: reviewFlipped ? "#2563eb" : cardBg, border: `1px solid ${reviewFlipped ? "#2563eb" : border}`,
            borderRadius: 20, padding: "3rem 2rem", textAlign: "center", cursor: "pointer",
            minHeight: 220, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            transition: "all 0.3s", marginBottom: "1rem",
          }}
        >
          <p style={{ color: reviewFlipped ? "rgba(255,255,255,0.7)" : text2, fontSize: "0.82rem", marginBottom: 8 }}>
            {reviewFlipped ? t(lang, "word_meaning") : t(lang, "word")}
          </p>
          <p style={{ color: reviewFlipped ? "white" : textCol, fontSize: "2rem", fontWeight: 800, margin: 0 }}>
            {reviewFlipped ? item.meaning : item.word}
          </p>
          {reviewFlipped && item.example && (
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.9rem", marginTop: 12, fontStyle: "italic" }}>{item.example}</p>
          )}
          <p style={{ color: reviewFlipped ? "rgba(255,255,255,0.5)" : text2, fontSize: "0.78rem", marginTop: 16 }}>
            {reviewFlipped ? t(lang, "tap_to_see_word") : t(lang, "tap_to_see_meaning")}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => { setReviewIndex(i => (i - 1 + filtered.length) % filtered.length); setReviewFlipped(false); }}
            style={{ flex: 1, padding: "0.85rem", background: cardBg, color: textCol, border: `1px solid ${border}`, borderRadius: 10, fontSize: "0.95rem", cursor: "pointer", fontWeight: 600 }}>
            ← {t(lang, "prev")}
          </button>
          <button onClick={() => { setReviewIndex(i => (i + 1) % filtered.length); setReviewFlipped(false); }}
            style={{ flex: 1, padding: "0.85rem", background: "#2563eb", color: "white", border: "none", borderRadius: 10, fontSize: "0.95rem", cursor: "pointer", fontWeight: 600 }}>
            {t(lang, "next")} →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem 1rem" }} className="animate-fade-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.25rem" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#2563eb", display: "flex", alignItems: "center", gap: "0.5rem", margin: 0 }}>
          🧠 {t(lang, "vocab_title")}
        </h2>
        <div style={{ display: "flex", gap: 8 }}>
          {filtered.length > 0 && (
            <button onClick={() => setReviewMode(true)} style={{ padding: "0.5rem 0.9rem", background: "#10b981", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 }}>
              {t(lang, "review_mode")}
            </button>
          )}
          <button onClick={() => setShowAdd(s => !s)} style={{ padding: "0.5rem 0.9rem", background: "#2563eb", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 }}>
            {showAdd ? `× ${t(lang, "close")}` : `+ ${t(lang, "add")}`}
          </button>
        </div>
      </div>
      <p style={{ color: text2, fontSize: "0.9rem", marginBottom: "1rem" }}>{items.length} {t(lang, "saved_words_count")}</p>

      {showAdd && (
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 16, padding: "1.25rem", marginBottom: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <input value={word} onChange={e => setWord(e.target.value)} placeholder={t(lang, "vocab_word_ph")} style={{ padding: "0.65rem 0.85rem", border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: textCol, fontSize: "0.9rem", outline: "none" }} />
            <input value={meaning} onChange={e => setMeaning(e.target.value)} placeholder={t(lang, "vocab_meaning_ph")} style={{ padding: "0.65rem 0.85rem", border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: textCol, fontSize: "0.9rem", outline: "none" }} />
          </div>
          <input value={example} onChange={e => setExample(e.target.value)} placeholder={t(lang, "example_optional")} style={{ width: "100%", padding: "0.65rem 0.85rem", border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: textCol, fontSize: "0.9rem", outline: "none", marginBottom: "0.75rem", boxSizing: "border-box" }} />
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <select value={wordLang} onChange={e => setWordLang(e.target.value)} style={{ flex: 1, padding: "0.65rem 0.85rem", border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: textCol, fontSize: "0.9rem", outline: "none" }}>
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
            </select>
            <button onClick={addWord} style={{ padding: "0.65rem 1.25rem", background: "#2563eb", color: "white", border: "none", borderRadius: 10, fontSize: "0.9rem", fontWeight: 700, cursor: "pointer" }}>
              {t(lang, "add")}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: "1rem" }}>
        {LANG_FILTER_CODES.map(l => (
          <button key={l.code} onClick={() => setFilterLang(l.code)}
            style={{ padding: "0.4rem 0.85rem", borderRadius: 20, border: "none", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600, background: filterLang === l.code ? "#2563eb" : (isDark ? "#334155" : "#e8edf5"), color: filterLang === l.code ? "white" : textCol }}>
            {l.flag} {filterName(l.code)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", paddingTop: 60, color: text2 }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📚</div>
          <p style={{ fontWeight: 600 }}>{t(lang, "no_vocab_yet")}</p>
        </div>
      ) : (
        filtered.map(item => (
          <div key={item.id} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 14, padding: "1rem 1.25rem", marginBottom: 8, cursor: "pointer" }}
            onClick={() => setFlipped(prev => ({ ...prev, [item.id]: !prev[item.id] }))}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <p style={{ color: textCol, fontSize: "1.1rem", fontWeight: 700, margin: "0 0 4px" }}>{item.word}</p>
                {flipped[item.id] ? (
                  <>
                    <p style={{ color: "#2563eb", fontSize: "0.95rem", fontWeight: 600, margin: "0 0 3px" }}>{item.meaning}</p>
                    {item.example && <p style={{ color: text2, fontSize: "0.82rem", fontStyle: "italic", margin: 0 }}>{item.example}</p>}
                  </>
                ) : (
                  <p style={{ color: text2, fontSize: "0.82rem" }}>{t(lang, "tap_to_see_meaning")}</p>
                )}
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginLeft: 12 }}>
                <span style={{ background: isDark ? "#334155" : "#f1f5f9", color: text2, padding: "3px 8px", borderRadius: 8, fontSize: "0.75rem", fontWeight: 600 }}>{item.lang}</span>
                <button onClick={e => { e.stopPropagation(); save(items.filter(i => i.id !== item.id)); }}
                  style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "1.2rem", padding: "0 4px" }}>×</button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
