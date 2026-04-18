import { useState, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

// Hangeul jamo decomposition tables
const INITIALS = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
const VOWELS   = ["ㅏ","ㅐ","ㅑ","ㅒ","ㅓ","ㅔ","ㅕ","ㅖ","ㅗ","ㅘ","ㅙ","ㅚ","ㅛ","ㅜ","ㅝ","ㅞ","ㅟ","ㅠ","ㅡ","ㅢ","ㅣ"];
const FINALS   = ["","ㄱ","ㄲ","ㄳ","ㄴ","ㄵ","ㄶ","ㄷ","ㄹ","ㄺ","ㄻ","ㄼ","ㄽ","ㄾ","ㄿ","ㅀ","ㅁ","ㅂ","ㅄ","ㅅ","ㅆ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];

const CONSONANTS = ["ㄱ","ㄲ","ㄳ","ㄴ","ㄵ","ㄶ","ㄷ","ㄸ","ㄹ","ㄺ","ㄻ","ㄼ","ㄽ","ㄾ","ㄿ","ㅀ","ㅁ","ㅂ","ㅃ","ㅄ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
const ALL_VOWELS = VOWELS;

function combineHangul(init: number, vowel: number, final: number): string {
  return String.fromCharCode(0xAC00 + init * 21 * 28 + vowel * 28 + final);
}

type State = { init: number | null; vowel: number | null; final: number | null };

function appendJamo(text: string, state: State, jamo: string): { text: string; state: State } {
  const vIdx = ALL_VOWELS.indexOf(jamo);
  const iIdx = INITIALS.indexOf(jamo);
  const fIdx = FINALS.indexOf(jamo);

  if (vIdx >= 0) {
    // It's a vowel
    if (state.init !== null && state.vowel === null) {
      return { text, state: { init: state.init, vowel: vIdx, final: null } };
    }
    if (state.init !== null && state.vowel !== null && state.final !== null) {
      // split final to new syllable
      const ch = combineHangul(state.init, state.vowel, 0);
      const newInit = INITIALS.indexOf(FINALS[state.final]);
      if (newInit >= 0) {
        const committed = text + ch;
        return { text: committed, state: { init: newInit, vowel: vIdx, final: null } };
      }
    }
    if (state.init !== null && state.vowel !== null && state.final === null) {
      const ch = combineHangul(state.init, state.vowel, 0);
      return { text: text + ch, state: { init: null, vowel: vIdx, final: null } };
    }
    // lone vowel
    return { text: text + (state.init !== null ? INITIALS[state.init] : ""), state: { init: null, vowel: vIdx, final: null } };
  }

  // Consonant
  if (state.vowel !== null && state.final === null && fIdx > 0) {
    return { text, state: { init: state.init, vowel: state.vowel, final: fIdx } };
  }
  // commit current state
  let committed = text;
  if (state.init !== null && state.vowel !== null) {
    committed += combineHangul(state.init, state.vowel, state.final ?? 0);
  } else if (state.vowel !== null) {
    committed += ALL_VOWELS[state.vowel];
  } else if (state.init !== null) {
    committed += INITIALS[state.init];
  }
  if (iIdx >= 0) {
    return { text: committed, state: { init: iIdx, vowel: null, final: null } };
  }
  return { text: committed + jamo, state: { init: null, vowel: null, final: null } };
}

function flushState(text: string, state: State): string {
  if (state.init !== null && state.vowel !== null)
    return text + combineHangul(state.init, state.vowel, state.final ?? 0);
  if (state.vowel !== null) return text + ALL_VOWELS[state.vowel];
  if (state.init !== null) return text + INITIALS[state.init];
  return text;
}

const ROW1_CONS = ["ㅂ","ㅈ","ㄷ","ㄱ","ㅅ","ㅛ","ㅕ","ㅑ","ㅐ","ㅔ"];
const ROW2_CONS = ["ㅁ","ㄴ","ㅇ","ㄹ","ㅎ","ㅗ","ㅓ","ㅏ","ㅣ"];
const ROW3_CONS = ["ㅋ","ㅌ","ㅊ","ㅍ","ㅠ","ㅜ","ㅡ"];

export default function KoreanKeyboardPage() {
  const { isDark, lang, showToast } = useApp();
  const [text, setText] = useState("");
  const [state, setState] = useState<State>({ init: null, vowel: null, final: null });

  const border = isDark ? "#334155" : "#e2e8f0";
  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const text2 = isDark ? "#94a3b8" : "#64748b";
  const inputBg = isDark ? "#0f172a" : "#f8fafc";
  const btnBg = isDark ? "#334155" : "#f1f5f9";

  const display = flushState(text, state);

  const pressKey = useCallback((jamo: string) => {
    const result = appendJamo(text, state, jamo);
    setText(result.text);
    setState(result.state);
  }, [text, state]);

  const backspace = useCallback(() => {
    if (state.final !== null) { setState(s => ({ ...s, final: null })); return; }
    if (state.vowel !== null) { setState(s => ({ ...s, vowel: null })); return; }
    if (state.init !== null) { setState({ init: null, vowel: null, final: null }); return; }
    setText(t => t.slice(0, -1));
  }, [state]);

  const clearAll = () => { setText(""); setState({ init: null, vowel: null, final: null }); };
  const addSpace = () => {
    const committed = flushState(text, state);
    setText(committed + " ");
    setState({ init: null, vowel: null, final: null });
  };

  const copy = () => {
    navigator.clipboard.writeText(display).then(() => showToast(t(lang, "korean_copied"), "success"));
  };

  const keyStyle = (wide?: boolean): React.CSSProperties => ({
    padding: wide ? "0.7rem 1rem" : "0.7rem",
    borderRadius: 10,
    border: `1px solid ${border}`,
    background: btnBg,
    color: textCol,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "1rem",
    minWidth: wide ? 60 : 40,
    flex: wide ? "0 0 auto" : "1",
    textAlign: "center",
  });

  const rows = [ROW1_CONS, ROW2_CONS, ROW3_CONS];

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "1.5rem 1rem" }} className="animate-fade-in">
      <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: textCol, marginBottom: "1rem" }}>⌨️ {t(lang, "korean_keyboard")}</h2>

      {/* Display */}
      <div className="glass" style={{ borderRadius: 14, padding: "1rem", marginBottom: "1rem", minHeight: 72, fontSize: "1.4rem", color: textCol, fontWeight: 600, wordBreak: "break-all", lineHeight: 1.5, background: inputBg, border: `1px solid ${border}` }}>
        {display || <span style={{ color: text2, fontSize: "0.9rem", fontWeight: 400 }}>{t(lang, "korean_type_here")}</span>}
        <span style={{ display: "inline-block", width: 2, height: "1.2em", background: "#2563eb", marginLeft: 2, verticalAlign: "text-bottom", animation: "blink 1s step-end infinite" }} />
        <style>{`@keyframes blink{50%{opacity:0}}`}</style>
      </div>

      {/* Action bar */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <button onClick={copy} style={{ ...keyStyle(true), background: "#2563eb", color: "white", border: "none" }}>📋 {t(lang, "korean_copy")}</button>
        <button onClick={clearAll} style={{ ...keyStyle(true), background: "#ef4444", color: "white", border: "none" }}>🗑 {t(lang, "korean_clear")}</button>
      </div>

      {/* Keyboard rows */}
      <div className="glass" style={{ borderRadius: 16, padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        {rows.map((row, ri) => (
          <div key={ri} style={{ display: "flex", gap: "0.35rem", justifyContent: "center" }}>
            {row.map(k => (
              <button key={k} onClick={() => pressKey(k)} style={keyStyle()}>{k}</button>
            ))}
          </div>
        ))}
        <div style={{ display: "flex", gap: "0.35rem", justifyContent: "center" }}>
          <button onClick={backspace} style={{ ...keyStyle(true), background: "#f59e0b", color: "white", border: "none" }}>⌫</button>
          <button onClick={addSpace} style={{ ...keyStyle(), flex: 3 }}>{"　"}</button>
          <button onClick={() => { const c = flushState(text, state); setText(c + "\n"); setState({ init: null, vowel: null, final: null }); }} style={{ ...keyStyle(true) }}>↵</button>
        </div>
      </div>

      <p style={{ fontSize: "0.75rem", color: text2, marginTop: "0.75rem", textAlign: "center", lineHeight: 1.5 }}>
        두벌식 입력 방식 · QWERTY 기반 한글 키보드
      </p>
    </div>
  );
}
