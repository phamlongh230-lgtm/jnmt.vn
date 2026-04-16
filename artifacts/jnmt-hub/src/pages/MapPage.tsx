import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

export default function MapPage() {
  const { lang, isDark } = useApp();
  const border = isDark ? "#334155" : "#e2e8f0";
  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const text2 = isDark ? "#94a3b8" : "#64748b";
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem 1rem" }} className="animate-fade-in">
      <div className="glass" style={{ borderRadius: 22, overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: `1px solid ${border}` }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#2563eb", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            🗺️ {t(lang, "map")}
          </h2>
          <p style={{ color: text2, fontSize: "0.85rem", marginTop: "0.25rem" }}>전남미래국제고등학교 — Gangjin-gun, Jeollanam-do</p>
        </div>

        <div style={{ position: "relative", width: "100%", height: 480 }}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3244.3085891694457!2d126.79!3d34.64!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDM4JzI0LjAiTiAxMjbCsDQ3JzI0LjAiRQ!5e0!3m2!1svi!2svn!4v1620000000000!5m2!1svi!2svn"
            width="100%"
            height="100%"
            style={{ border: "none" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="School Map"
          />
        </div>

        <div style={{ padding: "1.25rem 1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
              <span style={{ fontSize: "1.3rem" }}>📍</span>
              <div>
                <div style={{ fontWeight: 700, color: textCol, fontSize: "0.9rem" }}>Địa chỉ</div>
                <div style={{ color: text2, fontSize: "0.85rem" }}>Gangjin-gun, Jeollanam-do, South Korea</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
              <span style={{ fontSize: "1.3rem" }}>🌐</span>
              <div>
                <div style={{ fontWeight: 700, color: textCol, fontSize: "0.9rem" }}>Website</div>
                <a href="https://www.jnmt.kr" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", fontSize: "0.85rem", textDecoration: "none" }}>www.jnmt.kr</a>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
              <span style={{ fontSize: "1.3rem" }}>🚌</span>
              <div>
                <div style={{ fontWeight: 700, color: textCol, fontSize: "0.9rem" }}>Phương tiện</div>
                <div style={{ color: text2, fontSize: "0.85rem" }}>Xe buýt công cộng hoặc xe riêng</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
