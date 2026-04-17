import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

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
  { icon: "🚌", label: "Giao thông", value: "Xe buýt nội thị + taxi Kakao T" },
  { icon: "🌐", label: "Website", value: "www.jnmt.vn", isLink: true, href: "https://www.jnmt.vn" },
  { icon: "📞", label: "Điện thoại", value: "010-6315-8995", isLink: true, href: "tel:01063158995" },
];

export default function MapPage() {
  const { lang, isDark } = useApp();
  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const text2   = isDark ? "#94a3b8" : "#64748b";
  const border  = isDark ? "#334155" : "#e2e8f0";

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem 1rem" }} className="animate-fade-in">

      {/* Map embed */}
      <div className="glass" style={{ borderRadius: 22, overflow: "hidden", marginBottom: "1.25rem" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: `1px solid ${border}` }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#2563eb", display: "flex", alignItems: "center", gap: "0.5rem", margin: 0 }}>
            🗺️ {t(lang, "map")}
          </h2>
          <p style={{ color: text2, fontSize: "0.85rem", marginTop: "0.25rem", marginBottom: 0 }}>
            전남미래국제고등학교 — Gangjin-gun, Jeollanam-do
          </p>
        </div>

        <div style={{ position: "relative", width: "100%", height: 400 }}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3244.3085891694457!2d126.79!3d34.64!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDM4JzI0LjAiTiAxMjbCsDQ3JzI0LjAiRQ!5e0!3m2!1svi!2svn!4v1620000000000!5m2!1svi!2svn"
            width="100%" height="100%"
            style={{ border: "none", display: "block" }}
            allowFullScreen loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="School Map"
          />
        </div>

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
