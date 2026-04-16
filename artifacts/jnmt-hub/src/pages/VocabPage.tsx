import { useState, useEffect, useCallback } from "react";
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

interface QuizQuestion { item: VocabItem; choices: string[]; correctIdx: number; }

function buildQuiz(pool: VocabItem[]): QuizQuestion[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.map((item) => {
    const wrong = pool
      .filter((x) => x.id !== item.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((x) => x.meaning);
    const all = [...wrong, item.meaning].sort(() => Math.random() - 0.5);
    return { item, choices: all, correctIdx: all.indexOf(item.meaning) };
  });
}

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
  // Quiz state
  const [quizMode, setQuizMode] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizDone, setQuizDone] = useState(false);

  const border = isDark ? "#334155" : "#e2e8f0";
  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const text2 = isDark ? "#94a3b8" : "#64748b";
  const inputBg = isDark ? "#0f172a" : "#f8fafc";

  useEffect(() => {
    const saved = localStorage.getItem("jnmt_vocab");
    if (saved) setItems(JSON.parse(saved));
  }, []);

  function save(newItems: VocabItem[]) {
    setItems(newItems);
    localStorage.setItem("jnmt_vocab", JSON.stringify(newItems));
  }

  const startQuiz = useCallback(() => {
    if (filtered.length < 4) return;
    const qs = buildQuiz(filtered);
    setQuizQuestions(qs);
    setQuizIndex(0);
    setQuizScore(0);
    setQuizSelected(null);
    setQuizDone(false);
    setQuizMode(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered.length, filterLang]);

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

  // ── Quiz mode ──────────────────────────────────────────────
  if (quizMode) {
    if (quizDone) {
      const pct = Math.round((quizScore / quizQuestions.length) * 100);
      const emoji = pct === 100 ? "🏆" : pct >= 70 ? "🌟" : "💪";
      const msg = pct === 100 ? t(lang, "quiz_perfect") : pct >= 70 ? t(lang, "quiz_good") : t(lang, "quiz_keep_going");
      return (
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "1.5rem 1rem" }} className="animate-fade-in">
          <div className="glass-hero" style={{ background: "rgba(37,99,235,0.55)", borderRadius: 26, padding: "2.5rem 2rem", textAlign: "center", marginBottom: "1.25rem" }}>
            <div style={{ fontSize: "4rem", marginBottom: "0.75rem" }}>{emoji}</div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 900, marginBottom: "0.5rem" }}>{t(lang, "quiz_result")}</h2>
            <div style={{ fontSize: "3rem", fontWeight: 900, marginBottom: "0.25rem" }}>{quizScore}{t(lang, "quiz_of")}{quizQuestions.length}</div>
            <div style={{ opacity: 0.85, fontSize: "1rem" }}>{pct}% — {msg}</div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button onClick={() => { setQuizMode(false); }} className="glass"
              style={{ flex: 1, padding: "0.9rem", borderRadius: 14, cursor: "pointer", color: textCol, border: "none", fontWeight: 600, fontSize: "0.95rem" }}>
              ← {t(lang, "go_back")}
            </button>
            <button onClick={startQuiz}
              style={{ flex: 1, padding: "0.9rem", background: "#2563eb", color: "white", border: "none", borderRadius: 14, cursor: "pointer", fontWeight: 700, fontSize: "0.95rem" }}>
              🔄 {t(lang, "quiz_restart")}
            </button>
          </div>
        </div>
      );
    }

    const q = quizQuestions[quizIndex];
    const answered = quizSelected !== null;
    return (
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "1.5rem 1rem" }} className="animate-fade-in">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <button onClick={() => setQuizMode(false)}
            style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem" }}>
            ← {t(lang, "go_back")}
          </button>
          <span style={{ fontWeight: 700, color: text2, fontSize: "0.85rem" }}>
            {t(lang, "quiz_score_label")} {quizScore} · {quizIndex + 1}{t(lang, "quiz_of")}{quizQuestions.length}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ background: isDark ? "#334155" : "#e2e8f0", borderRadius: 100, height: 5, marginBottom: "1.25rem" }}>
          <div style={{ height: "100%", background: "#2563eb", borderRadius: 100, width: `${((quizIndex) / quizQuestions.length) * 100}%`, transition: "width 0.3s ease" }} />
        </div>

        {/* Word card */}
        <div className="glass-hero" style={{ background: "rgba(37,99,235,0.55)", borderRadius: 22, padding: "2rem", textAlign: "center", marginBottom: "1.25rem" }}>
          <div style={{ fontSize: "0.78rem", opacity: 0.8, marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: 1 }}>{t(lang, "word")}</div>
          <div style={{ fontSize: "2.2rem", fontWeight: 900 }}>{q.item.word}</div>
          {q.item.example && <div style={{ fontSize: "0.88rem", opacity: 0.75, marginTop: "0.5rem", fontStyle: "italic" }}>{q.item.example}</div>}
          <div style={{ display: "inline-block", background: "rgba(255,255,255,0.18)", padding: "0.15rem 0.6rem", borderRadius: 100, fontSize: "0.72rem", marginTop: "0.5rem" }}>{q.item.lang}</div>
        </div>

        {/* Choices */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.25rem" }}>
          {q.choices.map((choice, ci) => {
            const isCorrect = ci === q.correctIdx;
            const isSelected = ci === quizSelected;
            let bg = "transparent";
            let bdr = border;
            let col = textCol;
            if (answered) {
              if (isCorrect) { bg = isDark ? "#0f2e1b" : "#f0fdf4"; bdr = "#10b981"; col = "#059669"; }
              else if (isSelected) { bg = isDark ? "#2d1111" : "#fff1f2"; bdr = "#ef4444"; col = "#dc2626"; }
            }
            return (
              <button key={ci} disabled={answered}
                onClick={() => {
                  setQuizSelected(ci);
                  if (ci === q.correctIdx) setQuizScore((s) => s + 1);
                }}
                className="glass"
                style={{ padding: "0.9rem 1.1rem", borderRadius: 14, border: `2px solid ${bdr}`, background: bg, color: col, cursor: answered ? "default" : "pointer", fontWeight: isSelected || (answered && isCorrect) ? 700 : 400, fontSize: "0.95rem", textAlign: "left", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span style={{ width: 24, height: 24, borderRadius: "50%", background: answered && isCorrect ? "#10b981" : answered && isSelected ? "#ef4444" : isDark ? "#334155" : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: answered && (isCorrect || isSelected) ? "white" : text2, flexShrink: 0 }}>
                  {answered && isCorrect ? "✓" : answered && isSelected ? "✕" : String.fromCharCode(65 + ci)}
                </span>
                {choice}
              </button>
            );
          })}
        </div>

        {/* Feedback + Next */}
        {answered && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: quizSelected === q.correctIdx ? "#059669" : "#dc2626", marginBottom: "0.75rem" }}>
              {quizSelected === q.correctIdx ? `✅ ${t(lang, "quiz_correct")}` : `❌ ${t(lang, "quiz_wrong")} ${q.choices[q.correctIdx]}`}
            </div>
            <button
              onClick={() => {
                if (quizIndex + 1 >= quizQuestions.length) { setQuizDone(true); }
                else { setQuizIndex((i) => i + 1); setQuizSelected(null); }
              }}
              style={{ padding: "0.8rem 2rem", background: "#2563eb", color: "white", border: "none", borderRadius: 14, cursor: "pointer", fontWeight: 700, fontSize: "1rem" }}>
              {quizIndex + 1 >= quizQuestions.length ? t(lang, "quiz_finish") : t(lang, "quiz_next")}
            </button>
          </div>
        )}
      </div>
    );
  }

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
          className={reviewFlipped ? undefined : "glass"}
          style={{
            background: reviewFlipped ? "#2563eb" : undefined,
            border: reviewFlipped ? `1px solid #2563eb` : undefined,
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
            className="glass" style={{ flex: 1, padding: "0.85rem", color: textCol, borderRadius: 10, fontSize: "0.95rem", cursor: "pointer", fontWeight: 600 }}>
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
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {filtered.length >= 4 && (
            <button onClick={startQuiz} style={{ padding: "0.5rem 0.9rem", background: "#7c3aed", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 }}>
              🎯 {t(lang, "quiz_mode")}
            </button>
          )}
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
        <div className="glass" style={{ borderRadius: 22, padding: "1.25rem", marginBottom: "1rem" }}>
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
          <div key={item.id} className="glass" style={{ borderRadius: 14, padding: "1rem 1.25rem", marginBottom: 8, cursor: "pointer" }}
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
