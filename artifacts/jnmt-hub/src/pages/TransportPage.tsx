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
  mapsUrl: string;
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
    mapsUrl: "https://maps.google.com/?q=Gangjin+Express+Bus+Terminal",
  },
  {
    id: "2",
    nameLiteral: "Bus 810",
    destination: "Gangjin → Mokpo",
    schedule: "06:00, 07:30, 09:00, 10:30, 12:00, 13:30, 15:00, 16:30, 18:00, 19:30",
    price: "5,500 KRW",
    durationKey: "duration_1h30",
    noteKey: "route_2_note",
    mapsUrl: "https://maps.google.com/?q=Mokpo+Bus+Terminal",
  },
  {
    id: "3",
    nameLiteral: "Bus 830",
    destination: "Gangjin → Suncheon",
    schedule: "07:00, 09:00, 11:00, 13:00, 15:00, 17:00, 19:00",
    price: "7,200 KRW",
    durationKey: "duration_1h30",
    noteKey: "route_3_note",
    mapsUrl: "https://maps.google.com/?q=Suncheon+Bus+Terminal",
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
    mapsUrl: "https://maps.google.com/?q=Gangjin+County+Office",
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
    mapsUrl: "https://maps.google.com/?q=Gangjin",
  },
];

export default function TransportPage() {
  const { isDark, lang } = useApp();
  const [expanded, setExpanded] = useState<string | null>("1");

  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const text2 = isDark ? "#94a3b8" : "#64748b";
  const border = isDark ? "#334155" : "#e2e8f0";
  const accent = "#4361ee";

  return (
    <div style={{ padding: "20px 16px 80px" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <h2 style={{ color: textCol, fontSize: 20, fontWeight: 700, marginBottom: 4 }}>🚌 {t(lang, "transport_title")}</h2>
        <p style={{ color: text2, fontSize: 13, marginBottom: 20 }}>Gangjin-gun, Jeollanam-do</p>

        {ROUTES.map(route => {
          const name = route.nameKey ? t(lang, route.nameKey) : route.nameLiteral ?? "";
          const destination = route.destKey ? t(lang, route.destKey) : route.destination;
          return (
            <div key={route.id} className="glass" style={{ borderRadius: 14, marginBottom: 10, overflow: "hidden" }}>
              <button
                onClick={() => setExpanded(expanded === route.id ? null : route.id)}
                style={{ width: "100%", padding: "14px 16px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}
              >
                <div style={{ textAlign: "left" }}>
                  <p style={{ color: accent, fontWeight: 700, fontSize: 15, margin: 0 }}>{name}</p>
                  <p style={{ color: text2, fontSize: 13, margin: "2px 0 0" }}>{destination}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ color: textCol, fontWeight: 700, fontSize: 14, margin: 0 }}>{route.price}</p>
                  <p style={{ color: text2, fontSize: 12, margin: 0 }}>{t(lang, route.durationKey)}</p>
                </div>
              </button>

              {expanded === route.id && (
                <div style={{ borderTop: `1px solid ${border}`, padding: "14px 16px" }}>
                  <p style={{ color: textCol, fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{t(lang, "bus_schedule")}</p>
                  <p style={{ color: text2, fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>{route.schedule}</p>
                  <p style={{ color: textCol, fontSize: 13, marginBottom: 12 }}>
                    <span style={{ fontWeight: 600 }}>{t(lang, "note_label")} </span>{t(lang, route.noteKey)}
                  </p>
                  <a href={route.mapsUrl} target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", background: accent, color: "#fff", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
                    🗺️ {t(lang, "view_map")}
                  </a>
                </div>
              )}
            </div>
          );
        })}

        <div className="glass" style={{ borderRadius: 14, padding: 16, marginTop: 4 }}>
          <p style={{ color: textCol, fontSize: 14, fontWeight: 700, marginBottom: 10 }}>{t(lang, "useful_info")}</p>
          <p style={{ color: text2, fontSize: 13, lineHeight: 1.7, margin: 0 }}>
            • {t(lang, "transport_info_check")} <strong style={{ color: textCol }}>naver.com/map</strong> / <strong style={{ color: textCol }}>kakaomap.com</strong><br/>
            • {t(lang, "transport_info_buy")}<br/>
            • {t(lang, "transport_info_taxi")}<br/>
            • {t(lang, "transport_info_hotline")} <strong style={{ color: accent }}>1330</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
