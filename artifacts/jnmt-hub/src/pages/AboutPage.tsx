import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

const VERSION = "1.5.0";
const BUILD_DATE = "2026-04-17";

const FEATURES = [
  { icon: "📖", key: "dictionary" },
  { icon: "📅", key: "schedule" },
  { icon: "💬", key: "chat" },
  { icon: "🗺️", key: "map" },
  { icon: "📓", key: "notes_page" },
  { icon: "🧠", key: "vocab" },
  { icon: "⏱️", key: "timer" },
  { icon: "📆", key: "dday" },
  { icon: "📊", key: "gpa" },
  { icon: "🇰🇷", key: "koreanword" },
  { icon: "🤖", key: "ai" },
  { icon: "🍱", key: "menu" },
  { icon: "🚌", key: "transport" },
  { icon: "🌤️", key: "weather_tool" },
  { icon: "💱", key: "currency" },
  { icon: "📱", key: "qrcode" },
  { icon: "📝", key: "subtitle" },
  { icon: "🏥", key: "health" },
  { icon: "🌍", key: "timezone_tool" },
  { icon: "📢", key: "announcements" },
];

export default function AboutPage() {
  const { isDark, lang, setActivePage } = useApp();
  const text  = isDark ? "#f1f5f9" : "#0f172a";
  const text2 = isDark ? "#94a3b8" : "#64748b";
  const border = isDark ? "#334155" : "#e2e8f0";

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "1.5rem 1rem" }} className="animate-fade-in">

      {/* Hero */}
      <div className="glass-hero" style={{ background: "rgba(37,99,235,0.55)", borderRadius: 26, padding: "2rem", marginBottom: "1.5rem", textAlign: "center" }}>
        <div style={{ fontSize: "3.5rem", marginBottom: "0.75rem" }}>🎓</div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 900, margin: 0 }}>JNMT Student</h1>
        <p style={{ opacity: 0.85, margin: "0.4rem 0 0", fontSize: "0.9rem" }}>
          App học sinh · 전남미래국제고등학교
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
          <span style={{ background: "rgba(255,255,255,0.2)", padding: "0.25rem 0.75rem", borderRadius: 100, fontSize: "0.78rem", fontWeight: 700 }}>
            v{VERSION}
          </span>
          <span style={{ background: "rgba(255,255,255,0.2)", padding: "0.25rem 0.75rem", borderRadius: 100, fontSize: "0.78rem" }}>
            {BUILD_DATE}
          </span>
          <span style={{ background: "rgba(255,255,255,0.2)", padding: "0.25rem 0.75rem", borderRadius: 100, fontSize: "0.78rem" }}>
            6 {t(lang, "languages")}
          </span>
        </div>
      </div>

      {/* Creator */}
      <div className="glass" style={{ borderRadius: 22, padding: "1.25rem 1.5rem", marginBottom: "1.25rem" }}>
        <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: text, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          💻 {t(lang, "creator")}
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#0891b2)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: "1.3rem", flexShrink: 0 }}>VT</div>
          <div>
            <div style={{ fontWeight: 800, color: text, fontSize: "1.05rem" }}>Vũ Văn Tâm</div>
            <div style={{ fontSize: "0.82rem", color: text2 }}>{t(lang, "student_label")} · 전남미래국제고등학교 · 2026</div>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
              <a href="mailto:phamlongh230@gmail.com" style={{ fontSize: "0.78rem", color: "#2563eb", textDecoration: "none" }}>✉️ phamlongh230@gmail.com</a>
              <a href="tel:01063158995" style={{ fontSize: "0.78rem", color: "#2563eb", textDecoration: "none" }}>📞 010-6315-8995</a>
            </div>
          </div>
        </div>
        <div style={{ marginTop: "1rem", padding: "0.75rem", background: isDark ? "#0f172a" : "#f8fafc", borderRadius: 10, borderLeft: "3px solid #f59e0b", fontSize: "0.82rem", color: text2 }}>
          💡 App này được làm bởi học sinh để giúp các bạn học sinh JNMT. Không phải trang chính thức của trường.
        </div>
      </div>

      {/* Features */}
      <div className="glass" style={{ borderRadius: 22, padding: "1.25rem 1.5rem", marginBottom: "1.25rem" }}>
        <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: text, marginBottom: "1rem" }}>
          ⚡ {t(lang, "features")} ({FEATURES.length})
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "0.5rem" }}>
          {FEATURES.map(({ icon, key }) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.45rem 0.65rem", background: isDark ? "#0f172a" : "#f8fafc", borderRadius: 8, border: `1px solid ${border}`, fontSize: "0.82rem", color: text }}>
              <span>{icon}</span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t(lang, key)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tech stack */}
      <div className="glass" style={{ borderRadius: 22, padding: "1.25rem 1.5rem", marginBottom: "1.25rem" }}>
        <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: text, marginBottom: "1rem" }}>🛠️ Tech Stack</h3>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          {["React 19","TypeScript","Vite","Framer Motion","PostgreSQL","Node.js","Tailwind CSS","pnpm"].map((t) => (
            <span key={t} style={{ padding: "0.25rem 0.7rem", background: isDark ? "#1e293b" : "#f1f5f9", borderRadius: 100, fontSize: "0.78rem", color: text2, border: `1px solid ${border}`, fontWeight: 600 }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Back button */}
      <button onClick={() => setActivePage("home")}
        style={{ width: "100%", padding: "0.85rem", borderRadius: 14, border: "none", background: "#2563eb", color: "white", fontSize: "0.95rem", fontWeight: 700, cursor: "pointer" }}>
        ← {t(lang, "home")}
      </button>
    </div>
  );
}
