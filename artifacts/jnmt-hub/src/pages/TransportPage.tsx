import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

interface Route {
  id: string;
  nameKey?: string;
  nameLiteral?: string;
  destination: string;
  destKey?: string;
  schedule: string;
  price: string;
  durationKey: string;
  noteKey: string;
  kakaoUrl: string;
  icon: string;
  color: string;
}

const ROUTES: Route[] = [
  {
    id: "1",
    nameLiteral: "Bus 820",
    destination: "Gangjin → Gwangju",
    schedule: "05:40, 06:30, 07:20, 08:10, 09:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00, 16:00, 17:00, 18:00, 19:00, 20:00",
    price: "8,400 KRW",
    durationKey: "duration_2h",
    noteKey: "route_1_note",
    kakaoUrl: `https://map.kakao.com/link/to/${encodeURIComponent("광주버스터미널")},35.1456,126.9183`,
    icon: "🚌",
    color: "#2563eb",
  },
  {
    id: "2",
    nameLiteral: "Bus 810",
    destination: "Gangjin → Mokpo",
    schedule: "06:00, 07:30, 09:00, 10:30, 12:00, 13:30, 15:00, 16:30, 18:00, 19:30",
    price: "5,500 KRW",
    durationKey: "duration_1h30",
    noteKey: "route_2_note",
    kakaoUrl: `https://map.kakao.com/link/to/${encodeURIComponent("목포버스터미널")},34.8118,126.3923`,
    icon: "🚌",
    color: "#7c3aed",
  },
  {
    id: "3",
    nameLiteral: "Bus 830",
    destination: "Gangjin → Suncheon",
    schedule: "07:00, 09:00, 11:00, 13:00, 15:00, 17:00, 19:00",
    price: "7,200 KRW",
    durationKey: "duration_1h30",
    noteKey: "route_3_note",
    kakaoUrl: `https://map.kakao.com/link/to/${encodeURIComponent("순천버스터미널")},34.9496,127.4875`,
    icon: "🚌",
    color: "#059669",
  },
  {
    id: "4",
    nameKey: "route_city_bus",
    destination: "",
    destKey: "route_4_dest",
    schedule: "07:00, 08:00, 09:00, 10:30, 12:00, 13:30, 15:00, 17:00, 18:30",
    price: "1,500 KRW",
    durationKey: "duration_20min",
    noteKey: "route_4_note",
    kakaoUrl: `https://map.kakao.com/link/to/${encodeURIComponent("강진군청")},34.6427,126.7673`,
    icon: "🚐",
    color: "#d97706",
  },
  {
    id: "5",
    nameKey: "route_taxi",
    destination: "",
    destKey: "route_taxi_dest",
    schedule: "24/7",
    price: "4,000~7,000 KRW",
    durationKey: "duration_10min",
    noteKey: "route_5_note",
    kakaoUrl: "kakaoT://taxi",
    icon: "🚕",
    color: "#FEE500",
  },
];

export default function TransportPage() {
  const { isDark, lang } = useApp();
  const [expanded, setExpanded] = useState<string | null>("1");

  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const text2   = isDark ? "#94a3b8" : "#64748b";
  const border  = isDark ? "#334155" : "#e2e8f0";

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem 1rem" }} className="animate-fade-in">

      {/* Header */}
      <div className="glass" style={{ borderRadius: 22, padding: "1.25rem 1.5rem", marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#2563eb", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          🚌 {t(lang, "transport_title")}
        </h2>
        <p style={{ color: text2, fontSize: "0.82rem", marginTop: "0.2rem", marginBottom: 0 }}>
          Gangjin-gun, Jeollanam-do
        </p>
      </div>

      {/* Routes */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", marginBottom: "1.25rem" }}>
        {ROUTES.map(route => {
          const name = route.nameKey ? t(lang, route.nameKey) : route.nameLiteral ?? "";
          const destination = route.destKey ? t(lang, route.destKey) : route.destination;
          const isOpen = expanded === route.id;
          return (
            <div key={route.id} className="glass" style={{ borderRadius: 18, overflow: "hidden", borderLeft: `4px solid ${route.color}` }}>
              <button onClick={() => setExpanded(isOpen ? null : route.id)}
                style={{ width: "100%", padding: "1rem 1.25rem", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", textAlign: "left" }}>
                  <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>{route.icon}</span>
                  <div>
                    <p style={{ color: route.color, fontWeight: 700, fontSize: "0.95rem", margin: 0 }}>{name}</p>
                    <p style={{ color: text2, fontSize: "0.78rem", margin: "0.1rem 0 0" }}>{destination}</p>
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ color: textCol, fontWeight: 700, fontSize: "0.88rem", margin: 0 }}>{route.price}</p>
                  <p style={{ color: text2, fontSize: "0.75rem", margin: 0 }}>{t(lang, route.durationKey)}</p>
                </div>
              </button>

              {isOpen && (
                <div style={{ borderTop: `1px solid ${border}`, padding: "1rem 1.25rem" }}>
                  <p style={{ color: textCol, fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.4rem" }}>{t(lang, "bus_schedule")}</p>
                  <div style={{ background: isDark ? "#0f172a" : "#f8fafc", borderRadius: 10, padding: "0.65rem 0.85rem", marginBottom: "0.75rem", border: `1px solid ${border}` }}>
                    <p style={{ color: text2, fontSize: "0.82rem", lineHeight: 1.8, margin: 0 }}>{route.schedule}</p>
                  </div>
                  <p style={{ color: text2, fontSize: "0.82rem", marginBottom: "0.75rem", lineHeight: 1.5 }}>
                    <span style={{ fontWeight: 600, color: textCol }}>{t(lang, "note_label")} </span>
                    {t(lang, route.noteKey)}
                  </p>
                  <a href={route.kakaoUrl} target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1rem", background: "#FEE500", color: "#3A1D1D", borderRadius: 10, textDecoration: "none", fontSize: "0.82rem", fontWeight: 700, boxShadow: "0 2px 6px rgba(254,229,0,0.3)" }}>
                    🗺️ 카카오맵으로 길찾기
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Useful info */}
      <div className="glass" style={{ borderRadius: 22, padding: "1.25rem 1.5rem" }}>
        <p style={{ color: textCol, fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.85rem" }}>ℹ️ {t(lang, "useful_info")}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
          {[
            { icon: "🗺️", text: t(lang, "transport_info_check"), highlight: ["kakaomap.com", "naver.com/map"] },
            { icon: "🎫", text: t(lang, "transport_info_buy"), highlight: [] },
            { icon: "🚕", text: t(lang, "transport_info_taxi"), highlight: [] },
            { icon: "📞", text: `${t(lang, "transport_info_hotline")} 1330`, highlight: ["1330"] },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
              <span style={{ fontSize: "1rem", flexShrink: 0, marginTop: "0.1rem" }}>{item.icon}</span>
              <p style={{ color: text2, fontSize: "0.85rem", lineHeight: 1.6, margin: 0 }}>
                {item.text.split(new RegExp(`(${item.highlight.join("|")})`, "g")).map((part, j) =>
                  item.highlight.includes(part)
                    ? <strong key={j} style={{ color: "#2563eb" }}>{part}</strong>
                    : <span key={j}>{part}</span>
                )}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
