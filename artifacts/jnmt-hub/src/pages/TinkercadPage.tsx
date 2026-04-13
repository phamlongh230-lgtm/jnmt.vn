import { useApp } from "@/context/AppContext";

// ── Cấu hình lớp học ──────────────────────────────────────────────────────────
// Thay đường link bên dưới bằng link lớp học Tinkercad thực của trường
const CLASSROOM_URL = "https://www.tinkercad.com/joinclass/CHANGEME";
// ─────────────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: "🧊",
    title: "3D Design",
    titleKo: "3D 디자인",
    desc: "Thiết kế mô hình 3D, in 3D, tạo sản phẩm từ ý tưởng của bạn.",
    color: "#f97316",
  },
  {
    icon: "⚡",
    title: "Circuits",
    titleKo: "회로 시뮬레이션",
    desc: "Mô phỏng mạch điện, lập trình Arduino ngay trên trình duyệt.",
    color: "#2563eb",
  },
  {
    icon: "🧱",
    title: "Codeblocks",
    titleKo: "코드블록",
    desc: "Lập trình khối kéo-thả để tạo hình 3D theo lập trình.",
    color: "#7c3aed",
  },
];

const STEPS = [
  { num: "1", title: "Tạo tài khoản", desc: "Vào tinkercad.com → Sign Up → dùng Google hoặc email trường" },
  { num: "2", title: "Tham gia lớp", desc: 'Nhấn nút "Tham gia lớp học" bên dưới → nhập mã lớp do thầy/cô cung cấp' },
  { num: "3", title: "Bắt đầu thiết kế", desc: "Chọn dự án, làm bài tập và nộp trực tiếp trong Tinkercad" },
];

export default function TinkercadPage() {
  const { isDark } = useApp();

  const cardBg = isDark ? "#1e293b" : "white";
  const border = isDark ? "#334155" : "#e2e8f0";
  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const text2 = isDark ? "#94a3b8" : "#64748b";
  const bg2 = isDark ? "#0f172a" : "#f8fafc";

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "1.5rem 1rem" }} className="animate-fade-in">

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", borderRadius: 16, padding: "1.75rem 1.5rem", marginBottom: "1.25rem", color: "white", display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
        <div style={{ fontSize: "3.5rem", lineHeight: 1 }}>🔧</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.25rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 900, margin: 0 }}>Tinkercad</h1>
            <span style={{ background: "rgba(255,255,255,0.25)", borderRadius: 6, padding: "0.15rem 0.5rem", fontSize: "0.75rem", fontWeight: 700 }}>Classroom</span>
          </div>
          <p style={{ margin: 0, opacity: 0.9, fontSize: "0.9rem" }}>
            Thiết kế 3D · Mạch điện · Lập trình — 전남미래국제고등학교
          </p>
        </div>
        <a
          href={CLASSROOM_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ background: "white", color: "#ea580c", padding: "0.75rem 1.5rem", borderRadius: 10, fontWeight: 800, textDecoration: "none", fontSize: "0.95rem", flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", gap: "0.4rem" }}
        >
          🚀 Tham gia lớp học
        </a>
      </div>

      {/* Feature cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.85rem", marginBottom: "1.25rem" }}>
        {FEATURES.map((f) => (
          <div key={f.title} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 12, padding: "1.1rem", borderTop: `3px solid ${f.color}` }}>
            <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>{f.icon}</div>
            <div style={{ fontWeight: 700, color: textCol, marginBottom: "0.1rem" }}>{f.title}</div>
            <div style={{ fontSize: "0.72rem", color: f.color, fontWeight: 600, marginBottom: "0.4rem" }}>{f.titleKo}</div>
            <div style={{ fontSize: "0.83rem", color: text2, lineHeight: 1.5 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* Steps */}
      <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 12, padding: "1.25rem", marginBottom: "1.25rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: textCol, marginBottom: "1rem" }}>📋 Hướng dẫn bắt đầu</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {STEPS.map((step) => (
            <div key={step.num} style={{ display: "flex", gap: "0.85rem", alignItems: "flex-start" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#f97316", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "0.9rem", flexShrink: 0 }}>
                {step.num}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: textCol, fontSize: "0.9rem" }}>{step.title}</div>
                <div style={{ fontSize: "0.82rem", color: text2, marginTop: "0.15rem", lineHeight: 1.5 }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
        {[
          { icon: "🌐", label: "Trang chủ Tinkercad", url: "https://www.tinkercad.com" },
          { icon: "📚", label: "Bài học hướng dẫn", url: "https://www.tinkercad.com/learn" },
          { icon: "🎬", label: "Video tutorials (YouTube)", url: "https://www.youtube.com/results?search_query=tinkercad+tutorial+beginners" },
          { icon: "💬", label: "Diễn đàn hỗ trợ", url: "https://forums.autodesk.com/t5/tinkercad-discussions/bd-p/tinkercad" },
        ].map((link) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", gap: "0.6rem", background: bg2, border: `1px solid ${border}`, borderRadius: 10, padding: "0.75rem 1rem", textDecoration: "none", color: textCol, fontSize: "0.85rem", fontWeight: 500 }}
          >
            <span style={{ fontSize: "1.1rem" }}>{link.icon}</span>
            <span>{link.label}</span>
          </a>
        ))}
      </div>

      {/* Note for teacher */}
      <div style={{ background: isDark ? "#1e293b" : "#fffbeb", border: `1px solid ${isDark ? "#854d0e" : "#fde68a"}`, borderRadius: 10, padding: "0.9rem 1rem", fontSize: "0.82rem", color: isDark ? "#fbbf24" : "#92400e", lineHeight: 1.6 }}>
        <strong>📌 Ghi chú thầy/cô:</strong> Để cập nhật link lớp học, mở file{" "}
        <code style={{ background: isDark ? "#0f172a" : "#fef3c7", padding: "0.1rem 0.3rem", borderRadius: 4 }}>
          src/pages/TinkercadPage.tsx
        </code>{" "}
        và thay <code style={{ background: isDark ? "#0f172a" : "#fef3c7", padding: "0.1rem 0.3rem", borderRadius: 4 }}>CLASSROOM_URL</code> bằng link lớp thực tế.
      </div>
    </div>
  );
}
