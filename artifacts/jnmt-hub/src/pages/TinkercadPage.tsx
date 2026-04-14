import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { getToken } from "@/lib/auth";

interface ClassInfo { className: string; classCode: string; url: string; }

const FEATURES = [
  { icon: "🧊", title: "3D Design",   titleKo: "3D 디자인",     desc: "Thiết kế mô hình 3D, in 3D, tạo sản phẩm từ ý tưởng.", color: "#f97316" },
  { icon: "⚡", title: "Circuits",    titleKo: "회로 시뮬레이션", desc: "Mô phỏng mạch điện, lập trình Arduino ngay trên trình duyệt.", color: "#2563eb" },
  { icon: "🧱", title: "Codeblocks",  titleKo: "코드블록",       desc: "Lập trình khối kéo-thả để tạo hình 3D theo lập trình.", color: "#7c3aed" },
];

export default function TinkercadPage() {
  const { isDark, currentUser } = useApp();
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
      .catch(() => setError("Không tải được thông tin lớp."))
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
          <p style={{ margin: 0, opacity: 0.9, fontSize: "0.9rem" }}>Thiết kế 3D · Mạch điện · Lập trình — 전남미래국제고등학교</p>
        </div>

        {/* Join button — shown after loaded, uses server URL */}
        {loading ? (
          <div style={{ background: "rgba(255,255,255,0.2)", color: "white", padding: "0.75rem 1.5rem", borderRadius: 10, fontSize: "0.9rem" }}>Đang tải...</div>
        ) : classInfo ? (
          <button
            onClick={() => { window.open(classInfo.url, "_blank", "noopener,noreferrer"); setJoined(true); }}
            style={{ background: "white", color: "#ea580c", padding: "0.75rem 1.5rem", borderRadius: 10, fontWeight: 800, border: "none", fontSize: "0.95rem", cursor: "pointer", flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            🚀 Vào lớp {classInfo.className}
          </button>
        ) : (
          <div style={{ background: "rgba(255,255,255,0.15)", color: "white", padding: "0.75rem 1.25rem", borderRadius: 10, fontSize: "0.85rem", maxWidth: 200, textAlign: "center" }}>
            ⚠️ {error || "Chưa có lớp học"}
          </div>
        )}
      </div>

      {/* Class info card */}
      {classInfo && (
        <div style={{ background: isDark ? "#0c2a1e" : "#f0fdf4", border: "1px solid #86efac", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "1.5rem" }}>🎓</span>
          <div>
            <div style={{ fontWeight: 700, color: isDark ? "#86efac" : "#166534", fontSize: "0.95rem" }}>
              Lớp của bạn: <strong>{classInfo.className}</strong> ({classInfo.classCode})
            </div>
            <div style={{ fontSize: "0.78rem", color: isDark ? "#4ade80" : "#15803d", marginTop: 2 }}>
              🔒 Link lớp học được bảo vệ — chỉ bạn mới truy cập được lớp này
            </div>
          </div>
          {joined && <span style={{ marginLeft: "auto", fontSize: "0.8rem", background: "#dcfce7", color: "#166534", padding: "0.2rem 0.6rem", borderRadius: 20, fontWeight: 700 }}>✓ Đã vào lớp</span>}
        </div>
      )}

      {/* Error state */}
      {!loading && error && !classInfo && (
        <div style={{ background: isDark ? "#450a0a" : "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "1.25rem", marginBottom: "1.25rem", color: "#ef4444", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "1.5rem" }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 700, marginBottom: "0.2rem" }}>{error}</div>
            <div style={{ fontSize: "0.8rem", opacity: 0.8 }}>Vui lòng liên hệ Admin để được phân vào lớp học.</div>
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
            <div style={{ fontSize: "0.83rem", color: text2, lineHeight: 1.5 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* How to start */}
      <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 12, padding: "1.25rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: textCol, marginBottom: "1rem" }}>📋 Hướng dẫn bắt đầu</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {[
            { n: "1", t: "Tạo tài khoản Tinkercad", d: "Vào tinkercad.com → Sign Up → dùng email trường hoặc Google" },
            { n: "2", t: "Vào lớp của bạn", d: 'Nhấn nút "Vào lớp" ở trên — link lớp đã được Admin cài sẵn cho bạn' },
            { n: "3", t: "Bắt đầu thiết kế", d: "Chọn dự án, làm bài tập và nộp trực tiếp trong Tinkercad" },
          ].map((s) => (
            <div key={s.n} style={{ display: "flex", gap: "0.85rem", alignItems: "flex-start" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#f97316", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "0.9rem", flexShrink: 0 }}>{s.n}</div>
              <div>
                <div style={{ fontWeight: 700, color: textCol, fontSize: "0.9rem" }}>{s.t}</div>
                <div style={{ fontSize: "0.82rem", color: text2, marginTop: "0.15rem", lineHeight: 1.5 }}>{s.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
