import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { t, LANGUAGES, LangCode } from "@/lib/i18n";

const AVATAR_COLORS = [
  "#2563eb","#7c3aed","#059669","#d97706",
  "#dc2626","#0891b2","#db2777","#65a30d",
];

const ACCENT_PRESETS = [
  { color: "#2563eb", name: "Blue" },
  { color: "#7c3aed", name: "Purple" },
  { color: "#059669", name: "Green" },
  { color: "#d97706", name: "Amber" },
  { color: "#dc2626", name: "Red" },
  { color: "#0891b2", name: "Cyan" },
  { color: "#db2777", name: "Pink" },
  { color: "#0f172a", name: "Dark" },
];
const GRADIENT_PAIRS: Record<string, [string,string]> = {
  "#2563eb": ["#2563eb","#0891b2"],
  "#7c3aed": ["#7c3aed","#db2777"],
  "#059669": ["#059669","#0891b2"],
  "#d97706": ["#d97706","#dc2626"],
  "#dc2626": ["#dc2626","#d97706"],
  "#0891b2": ["#0891b2","#2563eb"],
  "#db2777": ["#db2777","#7c3aed"],
  "#65a30d": ["#65a30d","#059669"],
};

function getAvatarColor(): string {
  return localStorage.getItem("jnmt_avatar_color") || "#2563eb";
}

function getVocabCount(): number {
  try { return (JSON.parse(localStorage.getItem("jnmt_vocab") || "[]") as unknown[]).length; }
  catch { return 0; }
}
function getNotesStats(): { done: number; total: number } {
  try {
    const notes = JSON.parse(localStorage.getItem("jnmt_notes") || "[]") as { done: boolean }[];
    return { done: notes.filter((n) => n.done).length, total: notes.length };
  } catch { return { done: 0, total: 0 }; }
}
function getDdayCount(): number {
  try { return (JSON.parse(localStorage.getItem("jnmt_ddays") || "[]") as unknown[]).length; }
  catch { return 0; }
}

export default function ProfilePage() {
  const { lang, setLang, isDark, toggleDark, accentColor, setAccentColor, currentUser, updateUser, showToast } = useApp();

  const [avatarColor, setAvatarColorState] = useState(getAvatarColor);
  const [vocabCount] = useState(getVocabCount);
  const [notesStats] = useState(getNotesStats);
  const [ddayCount] = useState(getDdayCount);
  const [themeMode, setThemeMode] = useState<"auto"|"light"|"dark">(() => {
    const saved = localStorage.getItem("jnmt_theme");
    if (saved === "dark") return "dark";
    if (saved === "light") return "light";
    return "auto";
  });
  const [editingName, setEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || currentUser?.username || "");

  const text  = isDark ? "#f1f5f9" : "#0f172a";
  const text2 = isDark ? "#94a3b8" : "#64748b";
  const border = isDark ? "#334155" : "#e2e8f0";
  const inputBg = isDark ? "#0f172a" : "#f8fafc";

  const avatarInitial = (currentUser?.username || "?").charAt(0).toUpperCase();
  const [c1, c2] = GRADIENT_PAIRS[avatarColor] ?? [avatarColor, avatarColor];

  useEffect(() => {
    setDisplayName(currentUser?.displayName || currentUser?.username || "");
  }, [currentUser]);

  function handleColorChange(color: string) {
    setAvatarColorState(color);
    localStorage.setItem("jnmt_avatar_color", color);
    if (currentUser) updateUser({ ...currentUser, avatarColor: color });
    showToast(t(lang, "avatar_updated"), "success");
  }

  function handleTheme(mode: "auto"|"light"|"dark") {
    setThemeMode(mode);
    if (mode === "auto") {
      localStorage.removeItem("jnmt_theme");
      const h = new Date().getHours();
      const shouldDark = h >= 20 || h < 7;
      if (shouldDark !== isDark) toggleDark();
    } else {
      const wantDark = mode === "dark";
      localStorage.setItem("jnmt_theme", mode);
      if (wantDark !== isDark) toggleDark();
    }
  }

  function handleSaveName() {
    if (!displayName.trim() || !currentUser) return;
    updateUser({ ...currentUser, displayName: displayName.trim() });
    showToast(t(lang, "updated_ok"), "success");
    setEditingName(false);
  }

  const memberSince = currentUser
    ? new Date().toLocaleDateString("vi-VN", { year: "numeric", month: "long" })
    : "—";

  const progressPct = notesStats.total > 0
    ? Math.round((notesStats.done / notesStats.total) * 100) : 0;

  const STATS = [
    { icon: "🧠", label: t(lang, "profile_vocab_learned"), value: vocabCount, color: "#7c3aed", bg: isDark ? "#1e1a2e" : "#f5f3ff" },
    { icon: "✅", label: t(lang, "profile_notes_done"), value: notesStats.done, color: "#059669", bg: isDark ? "#0e2018" : "#f0fdf4" },
    { icon: "📓", label: t(lang, "profile_notes_total"), value: notesStats.total, color: "#2563eb", bg: isDark ? "#0e1628" : "#eff6ff" },
    { icon: "📆", label: "D-Day", value: ddayCount, color: "#dc2626", bg: isDark ? "#2a1010" : "#fff1f2" },
  ];

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "1.5rem 1rem" }} className="animate-fade-in">

      {/* ── Hero card ── */}
      <div className="glass-hero" style={{ background: `linear-gradient(135deg, ${c1}cc, ${c2}99)`, borderRadius: 26, padding: "2rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
          {/* Avatar */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: `linear-gradient(135deg, ${c1}, ${c2})`,
              border: "3px solid rgba(255,255,255,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "2rem", fontWeight: 900, color: "white",
              boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
            }}>
              {avatarInitial}
            </div>
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 180 }}>
            {editingName ? (
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.4rem" }}>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSaveName(); if (e.key === "Escape") setEditingName(false); }}
                  autoFocus
                  style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 8, padding: "0.35rem 0.65rem", color: "white", fontSize: "1.1rem", fontWeight: 700, outline: "none", width: "100%", backdropFilter: "blur(8px)" }}
                  placeholder={t(lang, "profile_display_name_ph")}
                />
                <button onClick={handleSaveName} style={{ background: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.4)", color: "white", borderRadius: 8, padding: "0.35rem 0.7rem", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem" }}>
                  ✓
                </button>
                <button onClick={() => setEditingName(false)} style={{ background: "none", border: "1px solid rgba(255,255,255,0.3)", color: "rgba(255,255,255,0.7)", borderRadius: 8, padding: "0.35rem 0.7rem", cursor: "pointer", fontSize: "0.85rem" }}>
                  ✕
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                <h1 style={{ fontSize: "1.4rem", fontWeight: 900, margin: 0 }}>
                  {currentUser?.displayName || currentUser?.username || "—"}
                </h1>
                <button onClick={() => setEditingName(true)}
                  style={{ background: "rgba(255,255,255,0.18)", border: "none", color: "rgba(255,255,255,0.8)", borderRadius: 6, width: 26, height: 26, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem" }}>
                  ✏️
                </button>
              </div>
            )}
            <div style={{ opacity: 0.82, fontSize: "0.85rem" }}>{currentUser?.email}</div>
            <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
              {currentUser?.role && currentUser.role !== "user" && (
                <span style={{ background: "rgba(255,255,255,0.22)", border: "1px solid rgba(255,255,255,0.35)", padding: "0.15rem 0.6rem", borderRadius: 100, fontSize: "0.75rem", fontWeight: 700 }}>
                  {currentUser.role === "admin" ? "⚙️ Admin" : "🛡️ Mod"}
                </span>
              )}
              <span style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", padding: "0.15rem 0.6rem", borderRadius: 100, fontSize: "0.75rem" }}>
                🗓️ {t(lang, "profile_member_since")} {memberSince}
              </span>
            </div>
          </div>
        </div>

        {/* Notes progress bar */}
        {notesStats.total > 0 && (
          <div style={{ marginTop: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", opacity: 0.85, marginBottom: "0.4rem" }}>
              <span>📓 {t(lang, "profile_notes_done")} {notesStats.done}/{notesStats.total}</span>
              <span>{progressPct}%</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 100, height: 6 }}>
              <div style={{ height: "100%", background: "rgba(255,255,255,0.85)", borderRadius: 100, width: `${progressPct}%`, transition: "width 0.5s ease" }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Stats ── */}
      <div className="glass" style={{ borderRadius: 22, padding: "1.25rem 1.5rem", marginBottom: "1.25rem" }}>
        <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: text, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          📊 {t(lang, "profile_stats")}
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "0.75rem" }}>
          {STATS.map((s) => (
            <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: "1rem", textAlign: "center", border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}` }}>
              <div style={{ fontSize: "1.8rem", marginBottom: "0.3rem" }}>{s.icon}</div>
              <div style={{ fontSize: "1.6rem", fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: "0.72rem", color: text2, marginTop: "0.25rem", lineHeight: 1.3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Avatar color picker ── */}
      <div className="glass" style={{ borderRadius: 22, padding: "1.25rem 1.5rem", marginBottom: "1.25rem" }}>
        <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: text, marginBottom: "1rem" }}>
          🎨 {t(lang, "avatar_color")}
        </h3>
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
          {AVATAR_COLORS.map((col) => {
            const [a, b] = GRADIENT_PAIRS[col] ?? [col, col];
            return (
              <button
                key={col}
                onClick={() => handleColorChange(col)}
                style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${a}, ${b})`,
                  border: avatarColor === col ? `3px solid ${text}` : "3px solid transparent",
                  cursor: "pointer", boxShadow: avatarColor === col ? "0 0 0 2px " + col : "none",
                  transition: "all 0.15s",
                }}
              />
            );
          })}
        </div>
      </div>

      {/* ── Language ── */}
      <div className="glass" style={{ borderRadius: 22, padding: "1.25rem 1.5rem", marginBottom: "1.25rem" }}>
        <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: text, marginBottom: "1rem" }}>
          🌐 {t(lang, "profile_language")}
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "0.5rem" }}>
          {LANGUAGES.map((l) => {
            const active = lang === l.code;
            return (
              <button
                key={l.code}
                onClick={() => setLang(l.code as LangCode)}
                style={{
                  padding: "0.55rem 0.75rem", borderRadius: 10, cursor: "pointer",
                  border: `1.5px solid ${active ? "#2563eb" : border}`,
                  background: active ? (isDark ? "rgba(37,99,235,0.2)" : "#eff6ff") : "transparent",
                  color: active ? "#2563eb" : text2,
                  fontWeight: active ? 700 : 400, fontSize: "0.85rem",
                  display: "flex", alignItems: "center", gap: "0.4rem",
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: "1.1rem" }}>{l.flag}</span>
                <span>{l.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Accent color ── */}
      <div className="glass" style={{ borderRadius: 22, padding: "1.25rem 1.5rem", marginBottom: "1.25rem" }}>
        <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: text, marginBottom: "0.3rem" }}>
          🎨 {t(lang, "accent_color")}
        </h3>
        <p style={{ fontSize: "0.75rem", color: text2, marginBottom: "0.85rem" }}>{t(lang, "accent_color_hint")}</p>
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
          {ACCENT_PRESETS.map(({ color, name }) => (
            <button
              key={color}
              title={name}
              onClick={() => { setAccentColor(color); showToast(t(lang, "accent_updated"), "success"); }}
              style={{
                width: 36, height: 36, borderRadius: "50%",
                background: color,
                border: accentColor === color ? `3px solid ${text}` : "3px solid transparent",
                cursor: "pointer",
                boxShadow: accentColor === color ? `0 0 0 2px ${color}` : "none",
                transition: "all 0.15s",
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Theme ── */}
      <div className="glass" style={{ borderRadius: 22, padding: "1.25rem 1.5rem", marginBottom: "1.25rem" }}>
        <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: text, marginBottom: "1rem" }}>
          🎨 {t(lang, "profile_theme")}
        </h3>
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
          {(["auto", "light", "dark"] as const).map((mode) => {
            const icons = { auto: "🌗", light: "☀️", dark: "🌙" };
            const active = themeMode === mode;
            return (
              <button
                key={mode}
                onClick={() => handleTheme(mode)}
                style={{
                  flex: 1, minWidth: 90, padding: "0.65rem 1rem", borderRadius: 12, cursor: "pointer",
                  border: `1.5px solid ${active ? "#2563eb" : border}`,
                  background: active ? (isDark ? "rgba(37,99,235,0.2)" : "#eff6ff") : "transparent",
                  color: active ? "#2563eb" : text2,
                  fontWeight: active ? 700 : 400, fontSize: "0.9rem",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem",
                  transition: "all 0.15s",
                }}
              >
                <span>{icons[mode]}</span>
                <span>{t(lang, `profile_theme_${mode}`)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Account info (read-only) ── */}
      <div className="glass" style={{ borderRadius: 22, padding: "1.25rem 1.5rem" }}>
        <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: text, marginBottom: "1rem" }}>
          👤 {t(lang, "student_info")}
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {[
            { label: t(lang, "username"), value: currentUser?.username },
            { label: t(lang, "email"), value: currentUser?.email },
            { label: "Role", value: currentUser?.role || "user" },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <span style={{ fontSize: "0.78rem", color: text2, minWidth: 90, flexShrink: 0 }}>{label}</span>
              <span style={{ fontSize: "0.88rem", color: text, fontWeight: 600, background: isDark ? "#0f172a" : "#f8fafc", padding: "0.3rem 0.7rem", borderRadius: 8, border: `1px solid ${border}` }}>
                {value || "—"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
