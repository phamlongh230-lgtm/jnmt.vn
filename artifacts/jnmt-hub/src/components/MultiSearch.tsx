import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

const ENGINES = [
  { id: "google",    label: "Google",     icon: "🌐", color: "#4285f4", url: (q: string) => `https://www.google.com/search?q=${q}` },
  { id: "youtube",   label: "YouTube",    icon: "▶️",  color: "#ff0000", url: (q: string) => `https://www.youtube.com/results?search_query=${q}` },
  { id: "naver",     label: "Naver",      icon: "🟢", color: "#03c75a", url: (q: string) => `https://search.naver.com/search.naver?query=${q}` },
  { id: "naverdict", label: "Naver Dict", icon: "📖", color: "#03c75a", url: (q: string) => `https://dict.naver.com/search.naver?dicQuery=${q}` },
  { id: "scholar",   label: "Scholar",    icon: "🎓", color: "#1a73e8", url: (q: string) => `https://scholar.google.com/scholar?q=${q}` },
  { id: "images",    label: "images",     icon: "🖼️",  color: "#ea4335", url: (q: string) => `https://www.google.com/search?q=${q}&tbm=isch` },
  { id: "perplexity",label: "Perplexity", icon: "🤖", color: "#7c3aed", url: (q: string) => `https://www.perplexity.ai/search?q=${q}` },
  { id: "github",    label: "GitHub",     icon: "🐙", color: "#24292f", url: (q: string) => `https://github.com/search?q=${q}` },
];

export default function MultiSearch() {
  const { isDark, lang } = useApp();
  const [query, setQuery] = useState("");
  const [engine, setEngine] = useState("google");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = ENGINES.find((e) => e.id === engine)!;
  const inputBg = isDark ? "#0f172a" : "white";
  const border = isDark ? "#334155" : "#e2e8f0";
  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const text2 = isDark ? "#64748b" : "#94a3b8";

  // Ctrl+K / "/" shortcut to focus
  useEffect(() => {
    function onKey(e: globalThis.KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const doSearch = () => {
    const q = query.trim();
    if (!q) return;
    window.open(selected.url(encodeURIComponent(q)), "_blank", "noopener,noreferrer");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") doSearch();
  };

  return (
    <div style={{ width: "100%" }}>
      {/* Search input row */}
      <div style={{
        display: "flex",
        alignItems: "center",
        background: inputBg,
        border: `2px solid ${focused ? selected.color : border}`,
        borderRadius: 14,
        padding: "0.5rem 0.5rem 0.5rem 1rem",
        gap: "0.6rem",
        transition: "border-color 0.15s, box-shadow 0.15s",
        boxShadow: focused ? `0 0 0 3px ${selected.color}28` : "0 2px 8px rgba(0,0,0,0.06)",
      }}>
        {/* Engine icon */}
        <span style={{ fontSize: "1.3rem", flexShrink: 0, lineHeight: 1 }}>{selected.icon}</span>

        {/* Input */}
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={`${t(lang, "search_on")} ${selected.id === "images" ? t(lang, "images_label") : selected.label}...`}
          style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "1.05rem", color: textCol, fontFamily: "inherit", minWidth: 0 }}
        />

        {/* Clear */}
        {query && (
          <button onClick={() => { setQuery(""); inputRef.current?.focus(); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: text2, fontSize: "1rem", padding: "0.2rem", lineHeight: 1, flexShrink: 0 }}>
            ✕
          </button>
        )}

        {/* Shortcut hint */}
        {!query && !focused && (
          <span style={{ fontSize: "0.72rem", color: text2, background: isDark ? "#1e293b" : "#f1f5f9", padding: "0.15rem 0.45rem", borderRadius: 5, flexShrink: 0, fontFamily: "monospace" }}>
            Ctrl+K
          </span>
        )}

        {/* Search button */}
        <button
          onClick={doSearch}
          style={{ background: selected.color, color: "white", border: "none", borderRadius: 10, padding: "0.6rem 1.2rem", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap", transition: "opacity 0.15s" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
        >
          {t(lang, "search_btn")}
        </button>
      </div>

      {/* Engine selector pills */}
      <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.65rem", flexWrap: "wrap" }}>
        {ENGINES.map((eng) => (
          <button
            key={eng.id}
            onClick={() => { setEngine(eng.id); inputRef.current?.focus(); }}
            style={{
              display: "flex", alignItems: "center", gap: "0.3rem",
              padding: "0.3rem 0.7rem",
              borderRadius: 20,
              border: engine === eng.id ? `2px solid ${eng.color}` : `1px solid ${border}`,
              background: engine === eng.id ? eng.color + "18" : "transparent",
              color: engine === eng.id ? eng.color : textCol,
              fontWeight: engine === eng.id ? 700 : 400,
              fontSize: "0.8rem",
              cursor: "pointer",
              transition: "all 0.12s",
            }}
          >
            <span style={{ fontSize: "0.9rem" }}>{eng.icon}</span>
            {eng.id === "images" ? t(lang, "images_label") : eng.label}
          </button>
        ))}
      </div>
    </div>
  );
}
