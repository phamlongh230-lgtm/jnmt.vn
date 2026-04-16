import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

interface WttrDay {
  date: string;
  maxtempC: string;
  mintempC: string;
  hourly: { weatherDesc: { value: string }[]; weatherIconUrl: { value: string }[] }[];
}
interface WttrData {
  current_condition: { temp_C: string; weatherDesc: { value: string }[]; humidity: string; windspeedKmph: string; weatherIconUrl: { value: string }[] }[];
  weather: WttrDay[];
}

const WEATHER_EMOJIS: Record<string, string> = {
  "Sunny": "☀️", "Clear": "🌙", "Partly cloudy": "⛅", "Cloudy": "☁️",
  "Overcast": "☁️", "Mist": "🌫️", "Fog": "🌫️", "Rain": "🌧️",
  "Drizzle": "🌦️", "Snow": "❄️", "Sleet": "🌨️", "Thunder": "⛈️",
  "Blizzard": "🌨️", "Blowing snow": "🌨️",
};
function getEmoji(desc: string) {
  for (const [k, v] of Object.entries(WEATHER_EMOJIS)) {
    if (desc.toLowerCase().includes(k.toLowerCase())) return v;
  }
  return "🌤️";
}

const DAY_VI = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export default function WeatherPage() {
  const { isDark, lang } = useApp();
  const [data, setData] = useState<WttrData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cardBg = isDark ? "#1e293b" : "white";
  const border = isDark ? "#334155" : "#e2e8f0";
  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const text2 = isDark ? "#94a3b8" : "#64748b";
  const bg2 = isDark ? "#0f172a" : "#f8fafc";

  useEffect(() => {
    fetch("https://wttr.in/Gangjin,Korea?format=j1")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setError(t(lang, "weather_error")); setLoading(false); });
  }, []);

  if (loading) return (
    <div style={{ maxWidth: 700, margin: "2rem auto", padding: "0 1rem", textAlign: "center", color: text2 }}>
      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🌤️</div>{t(lang, "loading_weather")}
    </div>
  );

  if (error || !data) return (
    <div style={{ maxWidth: 700, margin: "2rem auto", padding: "0 1rem", textAlign: "center", color: "#ef4444" }}>{error || t(lang, "weather_error")}</div>
  );

  const curr = data.current_condition[0];
  const emoji = getEmoji(curr.weatherDesc[0].value);

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "1.5rem 1rem" }} className="animate-fade-in">
      {/* Current */}
      <div style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)", borderRadius: 16, padding: "2rem", color: "white", marginBottom: "1.25rem", textAlign: "center" }}>
        <div style={{ fontSize: "0.9rem", opacity: 0.85, marginBottom: "0.5rem" }}>📍 강진군, 전라남도</div>
        <div style={{ fontSize: "5rem", lineHeight: 1, marginBottom: "0.5rem" }}>{emoji}</div>
        <div style={{ fontSize: "3.5rem", fontWeight: 900, lineHeight: 1 }}>{curr.temp_C}°C</div>
        <div style={{ fontSize: "1.1rem", opacity: 0.9, marginTop: "0.5rem" }}>{curr.weatherDesc[0].value}</div>
        <div style={{ display: "flex", justifyContent: "center", gap: "2rem", marginTop: "1rem", fontSize: "0.9rem", opacity: 0.85 }}>
          <span>💧 {curr.humidity}%</span>
          <span>💨 {curr.windspeedKmph} km/h</span>
        </div>
      </div>

      {/* 3-day forecast */}
      <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 12, padding: "1rem", marginBottom: "1rem" }}>
        <div style={{ fontWeight: 700, color: textCol, marginBottom: "0.85rem", fontSize: "0.95rem" }}>📅 Dự báo 3 ngày tới</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }}>
          {data.weather.map((day, i) => {
            const d = new Date(day.date);
            const dayName = i === 0 ? "Hôm nay" : DAY_VI[d.getDay()];
            const desc = day.hourly[4]?.weatherDesc[0]?.value || "";
            return (
              <div key={day.date} style={{ background: bg2, borderRadius: 10, padding: "0.85rem", textAlign: "center", border: `1px solid ${border}` }}>
                <div style={{ fontSize: "0.75rem", color: text2, fontWeight: 600, marginBottom: "0.3rem" }}>{dayName}</div>
                <div style={{ fontSize: "1.75rem", margin: "0.3rem 0" }}>{getEmoji(desc)}</div>
                <div style={{ fontSize: "0.8rem", color: textCol, fontWeight: 600 }}>{day.maxtempC}° / {day.mintempC}°</div>
                <div style={{ fontSize: "0.68rem", color: text2, marginTop: "0.2rem" }}>{desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ textAlign: "center", fontSize: "0.72rem", color: text2 }}>
        Dữ liệu từ wttr.in · Cập nhật mỗi lần tải trang
      </div>
    </div>
  );
}
