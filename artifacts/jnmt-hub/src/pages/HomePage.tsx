import { useEffect, useState, memo, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { t, LangCode } from "@/lib/i18n";
import MultiSearch from "@/components/MultiSearch";

// ─── All available tools for pinning ───────────────────────
const ALL_PINNABLE = [
  { page: "dictionary",    icon: "📖", key: "dictionary",    color: "#7c3aed" },
  { page: "schedule",      icon: "📅", key: "schedule",      color: "#0891b2" },
  { page: "chat",          icon: "💬", key: "chat",          color: "#059669" },
  { page: "map",           icon: "🗺️", key: "map",           color: "#d97706" },
  { page: "notes",         icon: "📓", key: "notes_page",    color: "#2563eb" },
  { page: "vocab",         icon: "🧠", key: "vocab",         color: "#059669" },
  { page: "timer",         icon: "⏱️", key: "timer",         color: "#d97706" },
  { page: "dday",          icon: "📆", key: "dday",          color: "#dc2626" },
  { page: "gpa",           icon: "📊", key: "gpa",           color: "#2563eb" },
  { page: "koreanword",    icon: "🇰🇷", key: "koreanword",    color: "#dc2626" },
  { page: "ai",            icon: "🤖", key: "ai",            color: "#7c3aed" },
  { page: "menu",          icon: "🍱", key: "menu",          color: "#059669" },
  { page: "transport",     icon: "🚌", key: "transport",     color: "#0891b2" },
  { page: "weather",       icon: "🌤️", key: "weather_tool",  color: "#0891b2" },
  { page: "currency",      icon: "💱", key: "currency",      color: "#059669" },
  { page: "qrcode",        icon: "📱", key: "qrcode",        color: "#7c3aed" },
  { page: "subtitle",      icon: "📝", key: "subtitle",      color: "#7c3aed" },
  { page: "health",        icon: "🏥", key: "health",        color: "#dc2626" },
  { page: "timezone",      icon: "🌍", key: "timezone_tool", color: "#0891b2" },
  { page: "announcements", icon: "📢", key: "announcements", color: "#2563eb" },
  { page: "links",         icon: "🔗", key: "links_page",    color: "#7c3aed" },
  { page: "social",        icon: "🌐", key: "social",         color: "#e879a0" },
];

const DEFAULT_PINNED = ["dictionary", "schedule", "chat", "map", "notes"];
const LS_PINNED = "jnmt_pinned";

function loadPinned(): string[] {
  try {
    const s = localStorage.getItem(LS_PINNED);
    if (s) {
      const arr = JSON.parse(s);
      if (Array.isArray(arr) && arr.length > 0) return arr;
    }
  } catch { /* ignore */ }
  return DEFAULT_PINNED;
}

function savePinned(p: string[]) {
  localStorage.setItem(LS_PINNED, JSON.stringify(p));
}

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

function CurrencyWidget({ lang, setActivePage }: { lang: LangCode; setActivePage: (p: string) => void }) {
  const [rate, setRate] = useState<number | null>(null);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [krwInput, setKrwInput] = useState("10000");
  const [vndInput, setVndInput] = useState("");

  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/krw.json")
      .then((r) => r.json())
      .then((d) => {
        const r: number = d.krw?.vnd;
        if (r) {
          setRate(r);
          setDate(d.date ?? "");
          const n = parseFloat("10000");
          setVndInput(Math.round(n * r).toLocaleString("vi-VN"));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function onKrw(v: string) {
    setKrwInput(v);
    const n = parseFloat(v) || 0;
    setVndInput(rate && n > 0 ? Math.round(n * rate).toLocaleString("vi-VN") : "");
  }

  function onVnd(v: string) {
    const raw = v.replace(/\D/g, "");
    setVndInput(raw ? parseInt(raw).toLocaleString("vi-VN") : "");
    const n = parseInt(raw) || 0;
    setKrwInput(rate && rate > 0 && n > 0 ? String(Math.round(n / rate)) : "");
  }

  return (
    <div>
      <div style={{ fontSize: "0.75rem", opacity: 0.7, marginBottom: "0.5rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
        {t(lang, "krw_vnd_widget")} 💱
      </div>
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem" }}>
          <div className="spinner" style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }} />
          <span style={{ opacity: 0.85 }}>{t(lang, "loading")}</span>
        </div>
      ) : (
        <div>
          {rate && (
            <div style={{ fontSize: "0.75rem", opacity: 0.75, marginBottom: "0.6rem" }}>
              1 ₩ = {rate.toFixed(2)} ₫ {date ? `· ${date}` : ""}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ fontSize: "1rem", flexShrink: 0 }}>🇰🇷</span>
              <input
                type="number"
                value={krwInput}
                onChange={(e) => onKrw(e.target.value)}
                placeholder="₩"
                style={{ flex: 1, padding: "0.4rem 0.5rem", borderRadius: 7, border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.15)", color: "white", fontSize: "0.9rem", fontWeight: 700, outline: "none", minWidth: 0 }}
              />
              <span style={{ fontSize: "0.75rem", opacity: 0.8, flexShrink: 0 }}>₩</span>
            </div>
            <div style={{ textAlign: "center", opacity: 0.7, fontSize: "0.8rem" }}>⇅</div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ fontSize: "1rem", flexShrink: 0 }}>🇻🇳</span>
              <input
                type="text"
                value={vndInput}
                onChange={(e) => onVnd(e.target.value)}
                placeholder="₫"
                style={{ flex: 1, padding: "0.4rem 0.5rem", borderRadius: 7, border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.15)", color: "white", fontSize: "0.9rem", fontWeight: 700, outline: "none", minWidth: 0 }}
              />
              <span style={{ fontSize: "0.75rem", opacity: 0.8, flexShrink: 0 }}>₫</span>
            </div>
          </div>
          <button onClick={() => setActivePage("currency")}
            style={{ marginTop: "0.6rem", width: "100%", padding: "0.35rem", borderRadius: 7, border: "1px solid rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.15)", color: "white", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
            {t(lang, "open_currency")} →
          </button>
        </div>
      )}
    </div>
  );
}

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

// ── Types ──────────────────────────────────────────────────
interface Announcement { id: number; title: string; content: string; authorUsername: string; isPinned: boolean; createdAt: string; }
interface DdayItem { id: string; name: string; date: string; icon: string; }
interface NoteItem { id: string; title: string; subject: string; dueDate: string; priority: string; done: boolean; }

function loadDdays(): DdayItem[] {
  try { return JSON.parse(localStorage.getItem("jnmt_ddays") || "[]"); }
  catch { return []; }
}
function loadPendingNotes(): NoteItem[] {
  try {
    const all: NoteItem[] = JSON.parse(localStorage.getItem("jnmt_notes") || "[]");
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return all
      .filter((n) => !n.done && n.dueDate)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 4);
  } catch { return []; }
}

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
    <div className="glass" style={{ borderRadius: 18, padding: "1.25rem", marginBottom: "1.5rem" }}>
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

function DdayWidget({ lang, isDark, text, border, setActivePage }: { lang: LangCode; isDark: boolean; text: string; border: string; setActivePage: (p: string) => void }) {
  const ddays = useMemo(() => loadDdays(), []);
  const today = new Date(); today.setHours(0, 0, 0, 0);

  if (ddays.length === 0) return null;
  return (
    <div className="glass" style={{ borderRadius: 18, padding: "1.25rem", flex: 1, minWidth: 220 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: text, margin: 0 }}>📆 {t(lang, "dday_widget_title")}</h3>
        <button onClick={() => setActivePage("dday")} style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600 }}>{t(lang, "view_all_dday")}</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
        {ddays.slice(0, 4).map((d) => {
          const dueDate = new Date(d.date + "T00:00:00"); dueDate.setHours(0, 0, 0, 0);
          const diff = Math.round((dueDate.getTime() - today.getTime()) / 86400000);
          const color = diff < 0 ? "#ef4444" : diff === 0 ? "#f59e0b" : diff <= 3 ? "#f97316" : "#2563eb";
          return (
            <div key={d.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.45rem 0.6rem", background: isDark ? "#0f172a" : "#f8fafc", borderRadius: 8, border: `1px solid ${border}` }}>
              <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{d.icon || "📆"}</span>
              <span style={{ flex: 1, fontSize: "0.82rem", color: text, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</span>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "white", background: color, padding: "0.1rem 0.5rem", borderRadius: 100, flexShrink: 0 }}>
                {diff < 0 ? `+${Math.abs(diff)}d` : diff === 0 ? "D-0" : `D-${diff}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HomeworkWidget({ lang, isDark, text, text2, border, setActivePage }: { lang: LangCode; isDark: boolean; text: string; text2: string; border: string; setActivePage: (p: string) => void }) {
  const notes = useMemo(() => loadPendingNotes(), []);
  const PRIORITY_COLORS: Record<string, string> = { high: "#ef4444", medium: "#f59e0b", low: "#10b981" };

  return (
    <div className="glass" style={{ borderRadius: 18, padding: "1.25rem", flex: 1, minWidth: 220 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: text, margin: 0 }}>📓 {t(lang, "hw_widget_title")}</h3>
        <button onClick={() => setActivePage("notes")} style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600 }}>{t(lang, "view_all_notes")}</button>
      </div>
      {notes.length === 0 ? (
        <div style={{ textAlign: "center", color: text2, padding: "1rem 0", fontSize: "0.85rem" }}>
          ✅ {t(lang, "no_upcoming_hw")}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
          {notes.map((n) => {
            const today = new Date(); today.setHours(0, 0, 0, 0);
            const due = new Date(n.dueDate + "T00:00:00"); due.setHours(0, 0, 0, 0);
            const diff = Math.round((due.getTime() - today.getTime()) / 86400000);
            const dueLabel = diff < 0 ? t(lang, "notes_overdue") : diff === 0 ? t(lang, "notes_due_today") : diff === 1 ? t(lang, "notes_due_tomorrow") : `${diff}d`;
            const dueColor = diff < 0 ? "#ef4444" : diff === 0 ? "#f59e0b" : diff === 1 ? "#f97316" : "#64748b";
            return (
              <div key={n.id} onClick={() => setActivePage("notes")} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.45rem 0.6rem", background: isDark ? "#0f172a" : "#f8fafc", borderRadius: 8, border: `1px solid ${border}`, borderLeft: `3px solid ${PRIORITY_COLORS[n.priority] || "#64748b"}`, cursor: "pointer" }}>
                <span style={{ flex: 1, fontSize: "0.82rem", color: text, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.title}</span>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: dueColor, flexShrink: 0 }}>{dueLabel}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const { lang, setActivePage, currentUser, isDark } = useApp();
  const [pinned, setPinned] = useState<string[]>(loadPinned);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const bg2 = isDark ? "#1e293b" : "#f8fafc";
  const text = isDark ? "#f1f5f9" : "#0f172a";
  const text2 = isDark ? "#94a3b8" : "#64748b";
  const border = isDark ? "#334155" : "#e2e8f0";

  function togglePin(page: string) {
    const next = pinned.includes(page)
      ? pinned.filter((p) => p !== page)
      : [...pinned, page];
    setPinned(next);
    savePinned(next);
  }

  function onDragStart(idx: number) { setDragIdx(idx); }
  function onDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const next = [...pinned];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(idx, 0, moved);
    setPinned(next);
    savePinned(next);
    setDragIdx(idx);
  }
  function onDragEnd() { setDragIdx(null); }

  const pinnedTools = ALL_PINNABLE.filter((t) => pinned.includes(t.page))
    .sort((a, b) => pinned.indexOf(a.page) - pinned.indexOf(b.page));

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "1.5rem 1rem" }} className="animate-fade-in">
      {/* Banner */}
      <div className="glass-hero" style={{ background: "rgba(37,99,235,0.55)", borderRadius: 22,  padding: "2rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 900, marginBottom: "0.25rem" }}>전남미래국제고등학교</h1>
            <p style={{ opacity: 0.85, marginBottom: "1rem", fontSize: "0.9rem" }}>Jeonnam Future International High School</p>
            <Clock lang={lang} />
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginTop: "1rem" }}>
              <a href="https://jnmt.hs.jne.kr/jnmt_hs/main.do?sysId=jnmt_hs" target="_blank" rel="noopener noreferrer"
                style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.35)", padding: "0.5rem 1rem", borderRadius: 8, textDecoration: "none", fontSize: "0.85rem", fontWeight: 600 }}>
                🌐 {t(lang, "website")}
              </a>
              <a href="https://jnmt.kr" target="_blank" rel="noopener noreferrer"
                style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.35)", padding: "0.5rem 1rem", borderRadius: 8, textDecoration: "none", fontSize: "0.85rem", fontWeight: 600 }}>
                📚 jnmt.kr
              </a>
              <a href="https://www.facebook.com/share/1AtjZfCMxM/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer"
                style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.35)", padding: "0.5rem 1rem", borderRadius: 8, textDecoration: "none", fontSize: "0.85rem", fontWeight: 600 }}>
                📘 {t(lang, "facebook")}
              </a>
            </div>
          </div>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ minWidth: 200, background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "1rem", border: "1px solid rgba(255,255,255,0.2)" }}>
              <div style={{ fontSize: "0.75rem", opacity: 0.7, marginBottom: "0.5rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
                {t(lang, "weather")} 🌡️
              </div>
              <WeatherWidget lang={lang} />
            </div>
            <div style={{ minWidth: 200, background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "1rem", border: "1px solid rgba(255,255,255,0.2)" }}>
              <CurrencyWidget lang={lang} setActivePage={setActivePage} />
            </div>
          </div>
        </div>
      </div>

      {/* Multi-engine search bar */}
      <div className="glass" style={{ borderRadius: 22, padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.85rem" }}>
          <span style={{ fontSize: "1.1rem" }}>🔍</span>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: isDark ? "#f1f5f9" : "#0f172a", margin: 0 }}>{t(lang, "multi_search_title")}</h3>
          <span style={{ fontSize: "0.75rem", color: isDark ? "#64748b" : "#94a3b8", marginLeft: "0.2rem" }}>Google · YouTube · Naver · Scholar · AI...</span>
        </div>
        <MultiSearch />
      </div>

      {/* Quick access — personalized pinned tools */}
      <div className="glass" style={{ borderRadius: 22, padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: text, margin: 0, display: "flex", alignItems: "center", gap: "0.4rem" }}>
            ⭐ {t(lang, "my_tools")}
          </h3>
          <button onClick={() => setCustomizeOpen((v) => !v)}
            style={{ background: customizeOpen ? "#2563eb" : "none", color: customizeOpen ? "white" : "#2563eb", border: `1px solid #2563eb`, padding: "0.3rem 0.85rem", borderRadius: 100, cursor: "pointer", fontSize: "0.78rem", fontWeight: 700, transition: "all 0.15s" }}>
            {customizeOpen ? t(lang, "tools_done") : t(lang, "customize_tools")}
          </button>
        </div>

        {/* Pinned tool cards */}
        {pinnedTools.length === 0 ? (
          <div style={{ textAlign: "center", color: text2, padding: "1.5rem 1rem", fontSize: "0.88rem" }}>
            {t(lang, "pin_tool_hint")}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "0.7rem" }}>
            {pinnedTools.map((card, idx) => (
              <button key={card.page} onClick={() => setActivePage(card.page)}
                className="glass"
                draggable
                onDragStart={() => onDragStart(idx)}
                onDragOver={(e) => onDragOver(e, idx)}
                onDragEnd={onDragEnd}
                style={{ borderRadius: 12, padding: "0.9rem 0.5rem", cursor: "grab", textAlign: "center", border: "none", transition: "transform 0.15s, opacity 0.15s", opacity: dragIdx === idx ? 0.45 : 1 }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ""; }}>
                <div style={{ fontSize: "1.8rem", marginBottom: "0.4rem" }}>{card.icon}</div>
                <div style={{ fontWeight: 700, color: card.color, fontSize: "0.82rem", lineHeight: 1.3 }}>{t(lang, card.key)}</div>
              </button>
            ))}
          </div>
        )}

        {/* Customize panel */}
        {customizeOpen && (
          <div style={{ marginTop: "1.1rem", borderTop: `1px solid ${border}`, paddingTop: "1rem" }}>
            <p style={{ fontSize: "0.78rem", color: text2, marginBottom: "0.75rem" }}>{t(lang, "pin_tool_hint")}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "0.5rem" }}>
              {ALL_PINNABLE.map((tool) => {
                const isPinned = pinned.includes(tool.page);
                return (
                  <button key={tool.page} onClick={() => togglePin(tool.page)}
                    style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.75rem", borderRadius: 9, cursor: "pointer", border: `1.5px solid ${isPinned ? tool.color : border}`, background: isPinned ? (isDark ? tool.color + "22" : tool.color + "12") : "transparent", color: isPinned ? tool.color : text2, fontWeight: isPinned ? 700 : 400, fontSize: "0.82rem", transition: "all 0.15s", textAlign: "left" }}>
                    <span style={{ fontSize: "1rem" }}>{tool.icon}</span>
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t(lang, tool.key)}</span>
                    {isPinned && <span style={{ fontSize: "0.65rem", opacity: 0.7 }}>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Announcements preview */}
      <AnnouncementsPreview isDark={isDark} text={text} text2={text2} lang={lang} setActivePage={setActivePage} />

      {/* ── Widgets row: D-Day + Homework ── */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <HomeworkWidget lang={lang} isDark={isDark} text={text} text2={text2} border={border} setActivePage={setActivePage} />
        <DdayWidget lang={lang} isDark={isDark} text={text} border={border} setActivePage={setActivePage} />
      </div>

      {/* Info section */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
        {/* School info */}
        <div className="glass" style={{ borderRadius: 18, padding: "1.25rem" }}>
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
        <div className="glass" style={{ borderRadius: 18, padding: "1.25rem" }}>
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
        <div className="glass" style={{ borderRadius: 18, padding: "1.25rem" }}>
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
