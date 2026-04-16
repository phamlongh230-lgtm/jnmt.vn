import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

const TIMEZONES = [
  { id: "Asia/Seoul", labelKey: "tz_korea", flag: "🇰🇷", city: "Seoul" },
  { id: "Asia/Ho_Chi_Minh", labelKey: "tz_vietnam", flag: "🇻🇳", city: "TP. Hồ Chí Minh" },
  { id: "Asia/Ulaanbaatar", labelKey: "tz_mongolia", flag: "🇲🇳", city: "Ulaanbaatar" },
  { id: "Asia/Almaty", labelKey: "tz_kazakhstan", flag: "🇰🇿", city: "Almaty" },
  { id: "Europe/Moscow", labelKey: "tz_russia", flag: "🇷🇺", city: "Moskva" },
  { id: "America/New_York", labelKey: "tz_usa", flag: "🇺🇸", city: "New York" },
  { id: "Europe/London", labelKey: "tz_uk", flag: "🇬🇧", city: "London" },
  { id: "Asia/Tokyo", labelKey: "tz_japan", flag: "🇯🇵", city: "Tokyo" },
];

function getTime(tz: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}

function getDate(tz: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: tz,
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());
}

function getOffset(tz: string) {
  const now = new Date();
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
  const localTime = new Date(now.toLocaleString("en-US", { timeZone: tz })).getTime();
  const offset = (localTime - utcTime) / 3600000;
  return offset >= 0 ? `UTC+${offset}` : `UTC${offset}`;
}

export default function TimezonePage() {
  const { isDark, lang } = useApp();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const cardBg = isDark ? "#1e293b" : "white";
  const border = isDark ? "#334155" : "#e2e8f0";
  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const text2 = isDark ? "#94a3b8" : "#64748b";

  const koreaHour = parseInt(getTime("Asia/Seoul").split(":")[0]);
  const isDayKorea = koreaHour >= 6 && koreaHour < 20;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "1.5rem 1rem" }} className="animate-fade-in">
      <div style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)", borderRadius: 16, padding: "1.5rem", color: "white", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <div style={{ fontSize: "3rem" }}>{isDayKorea ? "☀️" : "🌙"}</div>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 900, margin: 0, marginBottom: "0.25rem" }}>🌍 {t(lang, "timezone_tool")}</h1>
          <div style={{ fontSize: "2rem", fontWeight: 900, lineHeight: 1 }}>{getTime("Asia/Seoul")}</div>
          <div style={{ fontSize: "0.85rem", opacity: 0.85, marginTop: "0.15rem" }}>🇰🇷 {t(lang, "tz_korea")} — {getDate("Asia/Seoul")}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.75rem" }}>
        {TIMEZONES.map((tz) => {
          const isKorea = tz.id === "Asia/Seoul";
          return (
            <div key={tz.id} style={{ background: cardBg, border: `1px solid ${isKorea ? "#2563eb" : border}`, borderRadius: 12, padding: "1rem", borderLeft: isKorea ? "4px solid #2563eb" : undefined }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "1.5rem" }}>{tz.flag}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: textCol, fontSize: "0.9rem" }}>{t(lang, tz.labelKey)}</div>
                    <div style={{ fontSize: "0.7rem", color: text2 }}>{tz.city}</div>
                  </div>
                </div>
                <span style={{ fontSize: "0.7rem", color: text2, background: isDark ? "#0f172a" : "#f8fafc", padding: "0.2rem 0.5rem", borderRadius: 6, border: `1px solid ${border}` }}>
                  {getOffset(tz.id)}
                </span>
              </div>
              <div style={{ fontSize: "1.6rem", fontWeight: 900, color: isKorea ? "#2563eb" : textCol, lineHeight: 1 }}>
                {getTime(tz.id)}
              </div>
              <div style={{ fontSize: "0.75rem", color: text2, marginTop: "0.2rem" }}>{getDate(tz.id)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
