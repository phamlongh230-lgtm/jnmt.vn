import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";
import { getToken } from "@/lib/auth";

interface ClassInfo { className: string; classCode: string; url: string; }

const FEATURES = [
  { icon: "🧊", title: "3D Design",  titleKo: "3D 디자인",      descKey: "tinkercad_3d_desc",      color: "#f97316" },
  { icon: "⚡", title: "Circuits",   titleKo: "회로 시뮬레이션", descKey: "tinkercad_circuit_desc",  color: "#2563eb" },
  { icon: "🧱", title: "Codeblocks", titleKo: "코드블록",        descKey: "tinkercad_code_desc",     color: "#7c3aed" },
];

export default function TinkercadPage() {
  const { isDark, lang, currentUser } = useApp();
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joined, setJoined] = useState(false);

  const cardBg  = isDark ? "#1e293b" : "white";
  const border  = isDark ? "#334155" : "#e2e8f0";
  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const text2   = isDark ? "#94a3b8" : "#64748b";

  useEffect(() => {
    if (!currentUser) return;
    fetch("/api/tinkercad/my-class", { headers: { Authorization: `Bearer ${getToken()}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setClassInfo(d);
      })
      .catch(() => setError(t(lang, "tinkercad_load_error")))
      .finally(() => setLoading(false));
  }, [currentUser]);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "1.5rem 1rem" }} className="animate-fade-in">

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", borderRadius: 16, padding: "1.75rem 1.5rem", marginBottom: "1.25rem", color: "white", display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
        <div style={{ fontSize: "3.5rem", lineHeight: 1 }}>🔧</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.25rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 900, margin: 0 }}>Tinkercad</h1>
            <span style={{ background: "rgba(255,255,255,0.25)", borderRadius: 6, padding: "0.15rem 0.5rem", fontSize: "0.75rem", fontWeight: 700 }}>Classroom</span>
            {classInfo && <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: 6, padding: "0.15rem 0.5rem", fontSize: "0.75rem", fontWeight: 700 }}>{classInfo.className}</span>}
          </div>
          <p style={{ margin: 0, opacity: 0.9, fontSize: "0.9rem" }}>{t(lang, "tinkercad_desc")} — 전남미래국제고등학교</p>
        </div>

        {/* Join button — shown after loaded, uses server URL */}
        {loading ? (
          <div style={{ background: "rgba(255,255,255,0.2)", color: "white", padding: "0.75rem 1.5rem", borderRadius: 10, fontSize: "0.9rem" }}>{t(lang, "loading")}</div>
        ) : classInfo ? (
          <button
            onClick={() => { window.open(classInfo.url, "_blank", "noopener,noreferrer"); setJoined(true); }}
            style={{ background: "white", color: "#ea580c", padding: "0.75rem 1.5rem", borderRadius: 10, fontWeight: 800, border: "none", fontSize: "0.95rem", cursor: "pointer", flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            🚀 {t(lang, "enter_class_btn")} {classInfo.className}
          </button>
        ) : (
          <div style={{ background: "rgba(255,255,255,0.15)", color: "white", padding: "0.75rem 1.25rem", borderRadius: 10, fontSize: "0.85rem", maxWidth: 200, textAlign: "center" }}>
            ⚠️ {error || t(lang, "no_class_yet")}
          </div>
        )}
      </div>

      {/* Class info card */}
      {classInfo && (
        <div style={{ background: isDark ? "#0c2a1e" : "#f0fdf4", border: "1px solid #86efac", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "1.5rem" }}>🎓</span>
          <div>
            <div style={{ fontWeight: 700, color: isDark ? "#86efac" : "#166534", fontSize: "0.95rem" }}>
              {t(lang, "your_class_label")}: <strong>{classInfo.className}</strong> ({classInfo.classCode})
            </div>
            <div style={{ fontSize: "0.78rem", color: isDark ? "#4ade80" : "#15803d", marginTop: 2 }}>
              🔒 {t(lang, "class_link_protected")}
            </div>
          </div>
          {joined && <span style={{ marginLeft: "auto", fontSize: "0.8rem", background: "#dcfce7", color: "#166534", padding: "0.2rem 0.6rem", borderRadius: 20, fontWeight: 700 }}>✓ {t(lang, "class_joined_label")}</span>}
        </div>
      )}

      {/* Error state */}
      {!loading && error && !classInfo && (
        <div style={{ background: isDark ? "#450a0a" : "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "1.25rem", marginBottom: "1.25rem", color: "#ef4444", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "1.5rem" }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 700, marginBottom: "0.2rem" }}>{error}</div>
            <div style={{ fontSize: "0.8rem", opacity: 0.8 }}>{t(lang, "contact_admin_class")}</div>
          </div>
        </div>
      )}

      {/* Feature cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.85rem", marginBottom: "1.25rem" }}>
        {FEATURES.map((f) => (
          <div key={f.title} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 12, padding: "1.1rem", borderTop: `3px solid ${f.color}` }}>
            <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>{f.icon}</div>
            <div style={{ fontWeight: 700, color: textCol, marginBottom: "0.1rem" }}>{f.title}</div>
            <div style={{ fontSize: "0.72rem", color: f.color, fontWeight: 600, marginBottom: "0.4rem" }}>{f.titleKo}</div>
            <div style={{ fontSize: "0.83rem", color: text2, lineHeight: 1.5 }}>{t(lang, f.descKey)}</div>
          </div>
        ))}
      </div>

      {/* How to start */}
      <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 12, padding: "1.25rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: textCol, marginBottom: "1rem" }}>📋 {t(lang, "getting_started")}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {[
            { n: "1", tk: "tinkercad_step1_title", dk: "tinkercad_step1_desc" },
            { n: "2", tk: "tinkercad_step2_title", dk: "tinkercad_step2_desc" },
            { n: "3", tk: "tinkercad_step3_title", dk: "tinkercad_step3_desc" },
          ].map((s) => (
            <div key={s.n} style={{ display: "flex", gap: "0.85rem", alignItems: "flex-start" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#f97316", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "0.9rem", flexShrink: 0 }}>{s.n}</div>
              <div>
                <div style={{ fontWeight: 700, color: textCol, fontSize: "0.9rem" }}>{t(lang, s.tk)}</div>
                <div style={{ fontSize: "0.82rem", color: text2, marginTop: "0.15rem", lineHeight: 1.5 }}>{t(lang, s.dk)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
