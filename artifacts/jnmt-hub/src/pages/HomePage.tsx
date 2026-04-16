import { useEffect, useState, memo } from "react";
import { useApp } from "@/context/AppContext";
import { t, LangCode } from "@/lib/i18n";
import MultiSearch from "@/components/MultiSearch";

interface WeatherData {
  temp: string;
  desc: string;
  humidity: string;
  wind: string;
  icon: string;
  location: string;
}

const LANG_LOCALE: Record<LangCode, string> = {
  vi: "vi-VN", ko: "ko-KR", en: "en-US", mn: "mn-MN", kk: "kk-KZ", ru: "ru-RU",
};

const Clock = memo(function Clock({ lang }: { lang: LangCode }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const locale = LANG_LOCALE[lang] || "vi-VN";
  const timeStr = time.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr = time.toLocaleDateString(locale, { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
      <div style={{ fontSize: "2rem", fontWeight: 900, letterSpacing: 2, fontFamily: "monospace" }}>{timeStr}</div>
      <div style={{ fontSize: "0.9rem", opacity: 0.85 }}>{dateStr}</div>
    </div>
  );
});

function WeatherWidget({ lang }: { lang: LangCode }) {
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
        <span style={{ opacity: 0.85, fontSize: "0.9rem" }}>{t(lang, "loading_weather")}</span>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div style={{ padding: "0.75rem", opacity: 0.8, fontSize: "0.9rem" }}>
        ☁️ {t(lang, "weather_error")}
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
          <div style={{ opacity: 0.85 }}>💧 {t(lang, "humidity_label")}</div>
          <div style={{ fontWeight: 700 }}>{weather.humidity}%</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.12)", padding: "0.4rem 0.6rem", borderRadius: 6, textAlign: "center" }}>
          <div style={{ opacity: 0.85 }}>💨 {t(lang, "wind_label")}</div>
          <div style={{ fontWeight: 700 }}>{weather.wind} km/h</div>
        </div>
      </div>
      {weather.desc && (
        <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", opacity: 0.85, textAlign: "center" }}>{weather.desc}</div>
      )}
    </div>
  );
}

interface Announcement { id: number; title: string; content: string; authorUsername: string; isPinned: boolean; createdAt: string; }

function AnnouncementsPreview({ isDark, text, text2, lang, setActivePage }: { isDark: boolean; text: string; text2: string; lang: LangCode; setActivePage: (p: string) => void }) {
  const [items, setItems] = useState<Announcement[]>([]);
  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/announcements", { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d) ? d.slice(0, 3) : []))
      .catch(() => {});
    return () => ctrl.abort();
  }, []);
  if (items.length === 0) return null;
  return (
    <div className="glass" style={{ borderRadius: 12, padding: "1.25rem", marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#2563eb", margin: 0 }}>📢 {t(lang, "latest_announcements")}</h3>
        <button onClick={() => setActivePage("announcements")} style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>{t(lang, "see_all")}</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {items.map((item) => (
          <div key={item.id} onClick={() => setActivePage("announcements")} style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start", padding: "0.6rem 0.75rem", background: isDark ? "#0f172a" : "#f8fafc", borderRadius: 8, cursor: "pointer", borderLeft: item.isPinned ? "3px solid #2563eb" : `3px solid transparent` }}>
            {item.isPinned && <span style={{ fontSize: "0.7rem", background: "#2563eb", color: "white", padding: "0.1rem 0.35rem", borderRadius: 4, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>📌</span>}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, color: text, fontSize: "0.88rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</div>
              <div style={{ fontSize: "0.72rem", color: text2 }}>{item.authorUsername} · {new Date(item.createdAt).toLocaleDateString("vi-VN")}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const { lang, setActivePage, currentUser, isDark } = useApp();
  const bg2 = isDark ? "#1e293b" : "#f8fafc";
  const text = isDark ? "#f1f5f9" : "#0f172a";
  const text2 = isDark ? "#94a3b8" : "#64748b";

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "1.5rem 1rem" }} className="animate-fade-in">
      {/* Banner */}
      <div className="glass-hero" style={{ background: "rgba(37,99,235,0.55)", borderRadius: 16, padding: "2rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 900, marginBottom: "0.25rem" }}>전남미래국제고등학교</h1>
            <p style={{ opacity: 0.85, marginBottom: "1rem", fontSize: "0.9rem" }}>Jeonnam Future International High School</p>
            <Clock lang={lang} />
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

      {/* Multi-engine search bar */}
      <div className="glass" style={{ borderRadius: 16, padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.85rem" }}>
          <span style={{ fontSize: "1.1rem" }}>🔍</span>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: isDark ? "#f1f5f9" : "#0f172a", margin: 0 }}>{t(lang, "multi_search_title")}</h3>
          <span style={{ fontSize: "0.75rem", color: isDark ? "#64748b" : "#94a3b8", marginLeft: "0.2rem" }}>Google · YouTube · Naver · Scholar · AI...</span>
        </div>
        <MultiSearch />
      </div>

      {/* Quick access cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { icon: "📖", label: t(lang, "dictionary"), sub: t(lang, "six_languages"), page: "dictionary", color: "#7c3aed" },
          { icon: "📅", label: t(lang, "schedule"), sub: t(lang, "class_schedule_sub"), page: "schedule", color: "#0891b2" },
          { icon: "💬", label: t(lang, "chat"), sub: t(lang, "community_chat"), page: "chat", color: "#059669" },
          { icon: "🗺️", label: t(lang, "map"), sub: t(lang, "school_map_sub"), page: "map", color: "#d97706" },
        ].map((card) => (
          <button
            key={card.page}
            onClick={() => setActivePage(card.page)}
            className="glass"
            style={{ borderRadius: 12, padding: "1.25rem", cursor: "pointer", textAlign: "center", transition: "transform 0.15s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ""; }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{card.icon}</div>
            <div style={{ fontWeight: 700, color: card.color, fontSize: "0.95rem" }}>{card.label}</div>
            <div style={{ fontSize: "0.8rem", color: text2, marginTop: "0.2rem" }}>{card.sub}</div>
          </button>
        ))}
      </div>

      {/* Announcements preview */}
      <AnnouncementsPreview isDark={isDark} text={text} text2={text2} lang={lang} setActivePage={setActivePage} />

      {/* Info section */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
        {/* School info */}
        <div className="glass" style={{ borderRadius: 12, padding: "1.25rem" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#2563eb", fontWeight: 700, marginBottom: "1rem", fontSize: "1rem" }}>
            🏫 {t(lang, "school_info")}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {[
              [t(lang, "school_name_label"), "전남미래국제고등학교"],
              [t(lang, "school_name_en_label"), "Jeonnam Future International High School"],
              [t(lang, "school_founded_label"), "01/03/2026"],
              [t(lang, "school_location_label"), "Gangjin-gun, Jeollanam-do, Korea"],
              [t(lang, "school_target_label"), t(lang, "school_target_desc")],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.8rem", color: text2, minWidth: 90 }}>{label}</span>
                <span style={{ fontSize: "0.85rem", color: text, fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Student info */}
        <div className="glass" style={{ borderRadius: 12, padding: "1.25rem" }}>
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
        <div className="glass" style={{ borderRadius: 12, padding: "1.25rem" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#2563eb", fontWeight: 700, marginBottom: "1rem", fontSize: "1rem" }}>
            💻 {t(lang, "creator")}
          </h3>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #2563eb, #0891b2)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: "1.1rem", flexShrink: 0 }}>
              VT
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              <div style={{ fontWeight: 700, color: text }}>Vũ Văn Tâm</div>
              <div style={{ fontSize: "0.8rem", color: text2 }}>{t(lang, "student_label")} · 전남미래국제고등학교</div>
              <a href="mailto:phamlongh230@gmail.com"
                style={{ fontSize: "0.8rem", color: "#2563eb", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                ✉️ phamlongh230@gmail.com
              </a>
              <a href="tel:01063158995"
                style={{ fontSize: "0.8rem", color: "#2563eb", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                📞 010-6315-8995
              </a>
              <div style={{ fontSize: "0.75rem", color: text2, marginTop: "0.2rem", background: isDark ? "#0f172a" : "#f8fafc", padding: "0.35rem 0.6rem", borderRadius: 6, borderLeft: "3px solid #f59e0b" }}>
                💡 {t(lang, "contact_when_bug")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
