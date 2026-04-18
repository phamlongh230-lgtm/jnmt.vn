import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

const SCHOOL_LAT = 34.6302;
const SCHOOL_LNG = 126.8052;
const SCHOOL_NAME = "전남미래국제고등학교";

const KAKAO_MAP_URL = `https://map.kakao.com/link/map/${encodeURIComponent(SCHOOL_NAME)},${SCHOOL_LAT},${SCHOOL_LNG}`;
const KAKAO_NAVI_URL = `https://map.kakao.com/link/to/${encodeURIComponent(SCHOOL_NAME)},${SCHOOL_LAT},${SCHOOL_LNG}`;

const BUILDINGS = [
  {
    icon: "🏫", key: "map_classroom", color: "#2563eb",
    detail: "Khu A, B, C · Phòng học 101–310",
    hours: "07:00 – 22:00",
    note: "Cần thẻ học sinh để vào sau 20:00",
  },
  {
    icon: "🏠", key: "map_dorm", color: "#7c3aed",
    detail: "Ký túc xá Nam & Nữ riêng biệt",
    hours: "24/7",
    note: "Giờ đèn tắt: 23:00 · Cấm khách sau 22:00",
  },
  {
    icon: "⚽", key: "map_gym", color: "#059669",
    detail: "Sân thể dục trong nhà + sân cỏ ngoài trời",
    hours: "06:00 – 21:00",
    note: "Đăng ký sử dụng qua GV thể dục",
  },
  {
    icon: "🍱", key: "map_cafeteria", color: "#d97706",
    detail: "Sáng: 07:00 · Trưa: 12:00 · Tối: 18:00",
    hours: "07:00 – 19:30",
    note: "Quẹt thẻ khi vào ăn · 3 bữa/ngày",
  },
  {
    icon: "📚", key: "map_library", color: "#0891b2",
    detail: "Sách học tập, máy tính, phòng tự học yên tĩnh",
    hours: "08:00 – 22:00",
    note: "Yên lặng · Mượn sách tối đa 3 quyển",
  },
  {
    icon: "🏢", key: "map_admin_office", color: "#dc2626",
    detail: "Tầng 1 Tòa nhà Chính",
    hours: "09:00 – 17:00",
    note: "Nghỉ trưa: 12:00–13:00 · Thứ 2–6",
  },
];

const QUICK_INFO = [
  { icon: "📍", label: "Địa chỉ", value: "Gangjin-gun, Jeollanam-do, South Korea" },
  { icon: "🚌", label: "Giao thông", value: "Xe buýt nội thị + Kakao T" },
  { icon: "🌐", label: "Website", value: "jnmt.hs.jne.kr", isLink: true, href: "https://jnmt.hs.jne.kr/jnmt_hs/main.do?sysId=jnmt_hs" },
  { icon: "📞", label: "Điện thoại", value: "010-6315-8995", isLink: true, href: "tel:01063158995" },
];

export default function MapPage() {
  const { lang, isDark } = useApp();
  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const text2   = isDark ? "#94a3b8" : "#64748b";
  const border  = isDark ? "#334155" : "#e2e8f0";

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem 1rem" }} className="animate-fade-in">

      {/* KakaoMap card */}
      <div className="glass" style={{ borderRadius: 22, overflow: "hidden", marginBottom: "1.25rem" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
          <div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#FEE500", display: "flex", alignItems: "center", gap: "0.5rem", margin: 0, textShadow: isDark ? "none" : "0 1px 2px rgba(0,0,0,0.15)" }}>
              🗺️ {t(lang, "map")}
            </h2>
            <p style={{ color: text2, fontSize: "0.85rem", marginTop: "0.25rem", marginBottom: 0 }}>
              전남미래국제고등학교 — Gangjin-gun, Jeollanam-do
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <a
              href={KAKAO_MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.4rem",
                background: "#FEE500", color: "#3A1D1D", border: "none",
                borderRadius: 10, padding: "0.55rem 1rem", fontWeight: 700,
                fontSize: "0.85rem", textDecoration: "none", cursor: "pointer",
                boxShadow: "0 2px 8px rgba(254,229,0,0.4)",
              }}
            >
              <img src="https://t1.kakaocdn.net/kakaocorp/kakaocorp/admin/5f3b3a59017900001.png" alt="" style={{ width: 18, height: 18, borderRadius: 4 }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              카카오맵으로 보기
            </a>
            <a
              href={KAKAO_NAVI_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.4rem",
                background: isDark ? "#1e293b" : "#f1f5f9", color: textCol, border: `1px solid ${border}`,
                borderRadius: 10, padding: "0.55rem 1rem", fontWeight: 600,
                fontSize: "0.85rem", textDecoration: "none",
              }}
            >
              🧭 길찾기
            </a>
          </div>
        </div>

        {/* Map visual placeholder */}
        <div style={{ position: "relative", width: "100%", height: 320, background: isDark ? "#0f172a" : "#e8f4f0", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* Grid lines mimicking a map */}
          <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0, opacity: 0.08 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <line key={`v${i}`} x1={`${(i + 1) * 8.33}%`} y1="0" x2={`${(i + 1) * 8.33}%`} y2="100%" stroke={isDark ? "#94a3b8" : "#0f172a"} strokeWidth="1" />
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <line key={`h${i}`} x1="0" y1={`${(i + 1) * 12.5}%`} x2="100%" y2={`${(i + 1) * 12.5}%`} stroke={isDark ? "#94a3b8" : "#0f172a"} strokeWidth="1" />
            ))}
          </svg>

          {/* Decorative road lines */}
          <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0, opacity: 0.18 }}>
            <line x1="0" y1="60%" x2="100%" y2="60%" stroke={isDark ? "#60a5fa" : "#2563eb"} strokeWidth="3" />
            <line x1="35%" y1="0" x2="35%" y2="100%" stroke={isDark ? "#60a5fa" : "#2563eb"} strokeWidth="2" />
            <line x1="70%" y1="0" x2="70%" y2="100%" stroke={isDark ? "#60a5fa" : "#2563eb"} strokeWidth="2" />
            <line x1="0" y1="30%" x2="100%" y2="30%" stroke={isDark ? "#60a5fa" : "#2563eb"} strokeWidth="1.5" />
          </svg>

          {/* Center pin */}
          <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
            <div style={{ fontSize: "3rem", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))", animation: "pin-bounce 2s ease-in-out infinite" }}>📍</div>
            <div style={{ background: "#FEE500", color: "#3A1D1D", borderRadius: 20, padding: "0.4rem 1.1rem", fontWeight: 800, fontSize: "0.95rem", marginTop: "0.4rem", boxShadow: "0 2px 12px rgba(0,0,0,0.2)", maxWidth: 260 }}>
              전남미래국제고등학교
            </div>
            <div style={{ color: text2, fontSize: "0.78rem", marginTop: "0.3rem" }}>
              34.6302°N, 126.8052°E
            </div>
          </div>

          {/* Open KakaoMap overlay button */}
          <a
            href={KAKAO_MAP_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              position: "absolute", bottom: 12, right: 12,
              background: "rgba(0,0,0,0.55)", color: "white",
              borderRadius: 8, padding: "0.35rem 0.7rem",
              fontSize: "0.75rem", fontWeight: 600, textDecoration: "none",
              backdropFilter: "blur(4px)",
            }}
          >
            카카오맵에서 크게 보기 ↗
          </a>
        </div>
        <style>{`@keyframes pin-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }`}</style>

        {/* Quick info */}
        <div style={{ padding: "1.1rem 1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "0.75rem" }}>
            {QUICK_INFO.map((info) => (
              <div key={info.label} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>{info.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, color: textCol, fontSize: "0.82rem" }}>{info.label}</div>
                  {info.isLink ? (
                    <a href={info.href} target="_blank" rel="noopener noreferrer"
                      style={{ color: "#2563eb", fontSize: "0.82rem", textDecoration: "none" }}>
                      {info.value}
                    </a>
                  ) : (
                    <div style={{ color: text2, fontSize: "0.82rem" }}>{info.value}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Campus buildings */}
      <div className="glass" style={{ borderRadius: 22, padding: "1.5rem" }}>
        <h3 style={{ fontWeight: 700, color: textCol, marginBottom: "1rem", fontSize: "1rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          🏛️ {t(lang, "map_buildings")}
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0.85rem" }}>
          {BUILDINGS.map((b) => (
            <div key={b.key} className="glass" style={{ borderRadius: 16, padding: "1.1rem 1.25rem", borderLeft: `4px solid ${b.color}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.6rem" }}>
                <span style={{ fontSize: "1.6rem" }}>{b.icon}</span>
                <span style={{ fontWeight: 700, color: b.color, fontSize: "0.95rem" }}>{t(lang, b.key)}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                <div style={{ fontSize: "0.82rem", color: textCol }}>{b.detail}</div>
                <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ background: isDark ? "#0f172a" : "#f1f5f9", border: `1px solid ${border}`, padding: "0.15rem 0.55rem", borderRadius: 100, fontSize: "0.72rem", color: text2 }}>
                    🕐 {b.hours}
                  </span>
                </div>
                <div style={{ fontSize: "0.75rem", color: text2, background: isDark ? "#0f172a" : "#f8fafc", padding: "0.3rem 0.6rem", borderRadius: 6, borderLeft: `2px solid ${b.color}`, marginTop: "0.2rem" }}>
                  💡 {b.note}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
