import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";
import SchoolSearch from "@/components/SchoolSearch";

interface WeatherData {
  temp: string;
  desc: string;
  humidity: string;
  wind: string;
  icon: string;
  location: string;
}

function Clock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const days = ["Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const timeStr = time.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr = `${days[time.getDay()]}, ${time.toLocaleDateString("vi-VN")}`;

  return (
    <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
      <div style={{ fontSize: "2rem", fontWeight: 900, letterSpacing: 2, fontFamily: "monospace" }}>{timeStr}</div>
      <div style={{ fontSize: "0.9rem", opacity: 0.85 }}>{dateStr}</div>
    </div>
  );
}

function WeatherWidget({ lang }: { lang: string }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchWeather() {
      setLoading(true);
      setError(false);
      try {
        const response = await fetch(
          "https://wttr.in/Gangjin-gun,Jeollanam-do?format=j1",
          { signal: AbortSignal.timeout(8000) }
        );
        if (!response.ok) throw new Error("HTTP error");
        const data = await response.json();

        const current = data.current_condition?.[0];
        const area = data.nearest_area?.[0];
        const areaName = area?.areaName?.[0]?.value || "Jeollanam-do";
        const country = area?.country?.[0]?.value || "KR";

        const weatherDesc = current?.weatherDesc?.[0]?.value || "";
        const tempC = current?.temp_C || "--";
        const humidity = current?.humidity || "--";
        const windspeedKmph = current?.windspeedKmph || "--";

        const iconMap: Record<string, string> = {
          "Sunny": "☀️", "Clear": "🌙", "Partly cloudy": "⛅", "Overcast": "☁️",
          "Mist": "🌫️", "Light rain": "🌦️", "Moderate rain": "🌧️", "Heavy rain": "🌧️",
          "Thundery outbreaks possible": "⛈️", "Snow": "❄️", "Blizzard": "🌨️",
        };
        const icon = iconMap[weatherDesc] || "🌤️";

        setWeather({
          temp: tempC,
          desc: weatherDesc,
          humidity,
          wind: windspeedKmph,
          icon,
          location: `${areaName}, ${country}`,
        });
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem" }}>
        <div className="spinner" style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }} />
        <span style={{ opacity: 0.85, fontSize: "0.9rem" }}>Đang tải thời tiết...</span>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div style={{ padding: "0.75rem", opacity: 0.8, fontSize: "0.9rem" }}>
        ☁️ Không thể tải thời tiết
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span style={{ fontSize: "2.5rem" }}>{weather.icon}</span>
        <div>
          <div style={{ fontSize: "1.6rem", fontWeight: 900 }}>{weather.temp}°C</div>
          <div style={{ fontSize: "0.85rem", opacity: 0.85 }}>{weather.location}</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem", marginTop: "0.75rem", fontSize: "0.82rem" }}>
        <div style={{ background: "rgba(255,255,255,0.12)", padding: "0.4rem 0.6rem", borderRadius: 6, textAlign: "center" }}>
          <div style={{ opacity: 0.85 }}>💧 Độ ẩm</div>
          <div style={{ fontWeight: 700 }}>{weather.humidity}%</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.12)", padding: "0.4rem 0.6rem", borderRadius: 6, textAlign: "center" }}>
          <div style={{ opacity: 0.85 }}>💨 Gió</div>
          <div style={{ fontWeight: 700 }}>{weather.wind} km/h</div>
        </div>
      </div>
      {weather.desc && (
        <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", opacity: 0.85, textAlign: "center" }}>{weather.desc}</div>
      )}
    </div>
  );
}

export default function HomePage() {
  const { lang, setActivePage, currentUser, isDark } = useApp();
  const bg2 = isDark ? "#1e293b" : "#f8fafc";
  const border = isDark ? "#334155" : "#e2e8f0";
  const text = isDark ? "#f1f5f9" : "#0f172a";
  const text2 = isDark ? "#94a3b8" : "#64748b";

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "1.5rem 1rem" }} className="animate-fade-in">
      {/* Banner */}
      <div style={{ background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #7c3aed 100%)", color: "white", borderRadius: 16, padding: "2rem", marginBottom: "1.5rem", boxShadow: "0 4px 20px rgba(37,99,235,0.3)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 900, marginBottom: "0.25rem" }}>전남미래국제고등학교</h1>
            <p style={{ opacity: 0.85, marginBottom: "1rem", fontSize: "0.9rem" }}>Jeonnam Future International High School</p>
            <Clock />
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginTop: "1rem" }}>
              <a href="https://www.jnmt.kr" target="_blank" rel="noopener noreferrer"
                style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.35)", padding: "0.5rem 1rem", borderRadius: 8, textDecoration: "none", fontSize: "0.85rem", fontWeight: 600 }}>
                🌐 {t(lang, "website")}
              </a>
              <a href="https://www.facebook.com/share/1AtjZfCMxM/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer"
                style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.35)", padding: "0.5rem 1rem", borderRadius: 8, textDecoration: "none", fontSize: "0.85rem", fontWeight: 600 }}>
                📘 {t(lang, "facebook")}
              </a>
            </div>
          </div>
          <div style={{ minWidth: 200, background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "1rem", border: "1px solid rgba(255,255,255,0.2)" }}>
            <div style={{ fontSize: "0.75rem", opacity: 0.7, marginBottom: "0.5rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
              {t(lang, "weather")} 🌡️
            </div>
            <WeatherWidget lang={lang} />
          </div>
        </div>
      </div>

      {/* Quick access cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { icon: "📖", label: t(lang, "dictionary"), sub: "6 ngôn ngữ", page: "dictionary", color: "#7c3aed" },
          { icon: "📅", label: t(lang, "schedule"), sub: "Lịch học", page: "schedule", color: "#0891b2" },
          { icon: "💬", label: t(lang, "chat"), sub: t(lang, "community_chat"), page: "chat", color: "#059669" },
          { icon: "🗺️", label: t(lang, "map"), sub: "Bản đồ trường", page: "map", color: "#d97706" },
        ].map((card) => (
          <button
            key={card.page}
            onClick={() => setActivePage(card.page)}
            style={{ background: isDark ? "#1e293b" : "white", border: `1px solid ${border}`, borderRadius: 12, padding: "1.25rem", cursor: "pointer", textAlign: "center", transition: "transform 0.15s, box-shadow 0.15s", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(0,0,0,0.12)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{card.icon}</div>
            <div style={{ fontWeight: 700, color: card.color, fontSize: "0.95rem" }}>{card.label}</div>
            <div style={{ fontSize: "0.8rem", color: text2, marginTop: "0.2rem" }}>{card.sub}</div>
          </button>
        ))}
      </div>

      {/* School Search */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ background: isDark ? "#1e293b" : "white", border: `1px solid ${border}`, borderRadius: 16, padding: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#2563eb", fontWeight: 700, marginBottom: "0.6rem", fontSize: "1rem" }}>
            🏫 Tìm kiếm trường học
          </h3>
          <p style={{ fontSize: "0.82rem", color: text2, marginBottom: "1rem" }}>
            Tìm thông tin các trường đại học Hàn Quốc, Việt Nam và hơn thế nữa
          </p>
          <SchoolSearch />
        </div>
      </div>

      {/* Info section */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
        {/* School info */}
        <div style={{ background: isDark ? "#1e293b" : "white", border: `1px solid ${border}`, borderRadius: 12, padding: "1.25rem" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#2563eb", fontWeight: 700, marginBottom: "1rem", fontSize: "1rem" }}>
            🏫 {t(lang, "school_info")}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {[
              ["Tên trường", "전남미래국제고등학교"],
              ["Tên tiếng Anh", "Jeonnam Future International High School"],
              ["Khai trường", "01/03/2026"],
              ["Địa điểm", "Gangjin-gun, Jeollanam-do, Hàn Quốc"],
              ["Đối tượng", "Học sinh đa văn hóa & quốc tế"],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.8rem", color: text2, minWidth: 90 }}>{label}</span>
                <span style={{ fontSize: "0.85rem", color: text, fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Student info */}
        <div style={{ background: isDark ? "#1e293b" : "white", border: `1px solid ${border}`, borderRadius: 12, padding: "1.25rem" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#2563eb", fontWeight: 700, marginBottom: "1rem", fontSize: "1rem" }}>
            👤 {t(lang, "student_info")}
          </h3>
          {currentUser ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: bg2, borderRadius: 8, padding: "1rem" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #2563eb, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: "1.2rem", flexShrink: 0 }}>
                {currentUser.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: text }}>{currentUser.username}</div>
                <div style={{ fontSize: "0.8rem", color: text2 }}>{currentUser.email}</div>
                <div style={{ fontSize: "0.75rem", background: "#dcfce7", color: "#166534", padding: "0.1rem 0.5rem", borderRadius: 20, display: "inline-block", marginTop: "0.25rem" }}>
                  {currentUser.role}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ color: text2, textAlign: "center", padding: "1rem" }}>
              <p style={{ marginBottom: "0.5rem" }}>{t(lang, "not_logged")}</p>
            </div>
          )}
        </div>

        {/* Creator */}
        <div style={{ background: isDark ? "#1e293b" : "white", border: `1px solid ${border}`, borderRadius: 12, padding: "1.25rem" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#2563eb", fontWeight: 700, marginBottom: "1rem", fontSize: "1rem" }}>
            💻 {t(lang, "creator")}
          </h3>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #2563eb, #0891b2)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: "1.1rem", flexShrink: 0 }}>
              VT
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              <div style={{ fontWeight: 700, color: text }}>Vũ Văn Tâm</div>
              <div style={{ fontSize: "0.8rem", color: text2 }}>Học sinh · 전남미래국제고등학교</div>
              <a href="mailto:phamlongh230@gmail.com"
                style={{ fontSize: "0.8rem", color: "#2563eb", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                ✉️ phamlongh230@gmail.com
              </a>
              <a href="tel:01063158995"
                style={{ fontSize: "0.8rem", color: "#2563eb", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                📞 010-6315-8995
              </a>
              <div style={{ fontSize: "0.75rem", color: text2, marginTop: "0.2rem", background: isDark ? "#0f172a" : "#f8fafc", padding: "0.35rem 0.6rem", borderRadius: 6, borderLeft: "3px solid #f59e0b" }}>
                💡 Liên hệ khi gặp lỗi
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
