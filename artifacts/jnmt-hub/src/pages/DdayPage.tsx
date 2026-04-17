import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

interface DdayItem {
  id: string;
  name: string;
  date: string;
  icon: string;
  color: string;
}

const ICONS = ["📝", "🎯", "✈️", "🏖️", "🎓", "💼", "❤️", "⭐", "🎂", "🏆", "🎮", "🏃", "📚", "🎵", "🌸"];
const COLORS = [
  { hex: "#2563eb", label: "Blue" },
  { hex: "#7c3aed", label: "Purple" },
  { hex: "#059669", label: "Green" },
  { hex: "#d97706", label: "Amber" },
  { hex: "#dc2626", label: "Red" },
  { hex: "#0891b2", label: "Cyan" },
  { hex: "#db2777", label: "Pink" },
];

function diffDays(dateStr: string) {
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function DdayPage() {
  const { isDark, lang } = useApp();
  const [items, setItems] = useState<DdayItem[]>([]);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [icon, setIcon] = useState("📝");
  const [color, setColor] = useState("#2563eb");
  const [showAdd, setShowAdd] = useState(false);

  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const text2   = isDark ? "#94a3b8" : "#64748b";
  const border  = isDark ? "#334155" : "#e2e8f0";
  const inputBg = isDark ? "#0f172a" : "#f8fafc";

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem("jnmt_ddays") || "[]")); } catch { /* */ }
  }, []);

  function save(newItems: DdayItem[]) {
    const sorted = [...newItems].sort((a, b) => Math.abs(diffDays(a.date)) - Math.abs(diffDays(b.date)));
    setItems(sorted);
    localStorage.setItem("jnmt_ddays", JSON.stringify(sorted));
  }

  function addItem() {
    if (!name.trim() || !date) return;
    save([...items, { id: Date.now().toString(), name, date, icon, color }]);
    setName(""); setDate(""); setIcon("📝"); setColor("#2563eb");
    setShowAdd(false);
  }

  function deleteItem(id: string) {
    save(items.filter(i => i.id !== id));
  }

  const upcoming = items.filter(i => diffDays(i.date) >= 0);
  const past = items.filter(i => diffDays(i.date) < 0);

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "1.5rem 1rem" }} className="animate-fade-in">

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#2563eb", margin: 0, display: "flex", alignItems: "center", gap: "0.4rem" }}>
            ⏳ D-Day
          </h2>
          <p style={{ color: text2, fontSize: "0.82rem", marginTop: "0.2rem", marginBottom: 0 }}>
            {t(lang, "dday_subtitle")}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(v => !v)}
          style={{ padding: "0.55rem 1.1rem", background: showAdd ? (isDark ? "#334155" : "#f1f5f9") : "#2563eb", color: showAdd ? textCol : "white", border: `1px solid ${showAdd ? border : "transparent"}`, borderRadius: 12, fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}
        >
          {showAdd ? "✕" : `+ ${t(lang, "add_dday_btn")}`}
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="glass" style={{ borderRadius: 22, padding: "1.5rem", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t(lang, "event_name")}
              style={{ padding: "0.65rem 0.85rem", border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: textCol, fontSize: "0.9rem", outline: "none" }}
            />
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={{ padding: "0.65rem 0.85rem", border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: textCol, fontSize: "0.9rem", outline: "none" }}
            />

            <div>
              <p style={{ color: text2, fontSize: "0.78rem", marginBottom: "0.5rem" }}>{t(lang, "choose_icon")}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {ICONS.map(ic => (
                  <button key={ic} onClick={() => setIcon(ic)}
                    style={{ fontSize: "1.4rem", padding: "0.3rem 0.45rem", borderRadius: 8, border: `2px solid ${icon === ic ? "#2563eb" : border}`, background: icon === ic ? (isDark ? "#1e3a5f" : "#eff6ff") : "transparent", cursor: "pointer" }}>
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p style={{ color: text2, fontSize: "0.78rem", marginBottom: "0.5rem" }}>Màu sắc</p>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                {COLORS.map(c => (
                  <button key={c.hex} onClick={() => setColor(c.hex)}
                    style={{ width: 30, height: 30, borderRadius: "50%", background: c.hex, border: color === c.hex ? `3px solid ${textCol}` : "3px solid transparent", cursor: "pointer", boxShadow: color === c.hex ? `0 0 0 2px ${c.hex}` : "none" }} />
                ))}
              </div>
            </div>

            <button
              onClick={addItem}
              disabled={!name.trim() || !date}
              style={{ padding: "0.7rem", background: "#2563eb", color: "white", border: "none", borderRadius: 10, fontWeight: 700, cursor: name.trim() && date ? "pointer" : "default", opacity: name.trim() && date ? 1 : 0.5 }}
            >
              {t(lang, "add_event_btn")}
            </button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="glass" style={{ borderRadius: 22, padding: "3rem", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>📅</div>
          <p style={{ fontWeight: 600, color: textCol }}>{t(lang, "no_events")}</p>
          <p style={{ fontSize: "0.85rem", color: text2, marginTop: "0.25rem" }}>Thêm sự kiện để đếm ngược</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div style={{ marginBottom: "1.25rem" }}>
              <p style={{ fontSize: "0.78rem", fontWeight: 700, color: text2, textTransform: "uppercase", letterSpacing: 1, marginBottom: "0.65rem" }}>
                ⏰ Sắp tới ({upcoming.length})
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                {upcoming.map(item => {
                  const diff = diffDays(item.date);
                  const isToday = diff === 0;
                  return (
                    <div key={item.id} className="glass" style={{ borderRadius: 18, padding: "1.1rem 1.25rem", borderLeft: `4px solid ${item.color}`, display: "flex", alignItems: "center", gap: "1rem" }}>
                      <span style={{ fontSize: "2rem", flexShrink: 0 }}>{item.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, color: textCol, fontSize: "0.95rem", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</p>
                        <p style={{ color: text2, fontSize: "0.75rem", margin: "0.2rem 0 0" }}>{new Date(item.date).toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" })}</p>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: "1.5rem", fontWeight: 900, color: isToday ? "#f59e0b" : item.color, lineHeight: 1 }}>
                          {isToday ? t(lang, "today") : `D-${diff}`}
                        </div>
                        {!isToday && <div style={{ fontSize: "0.7rem", color: text2 }}>còn {diff} ngày</div>}
                      </div>
                      <button onClick={() => deleteItem(item.id)}
                        style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "1.1rem", flexShrink: 0, opacity: 0.6, padding: "0.25rem" }}>
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <p style={{ fontSize: "0.78rem", fontWeight: 700, color: text2, textTransform: "uppercase", letterSpacing: 1, marginBottom: "0.65rem" }}>
                ✅ Đã qua ({past.length})
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {past.map(item => {
                  const diff = Math.abs(diffDays(item.date));
                  return (
                    <div key={item.id} className="glass" style={{ borderRadius: 14, padding: "0.85rem 1.1rem", display: "flex", alignItems: "center", gap: "0.75rem", opacity: 0.65 }}>
                      <span style={{ fontSize: "1.5rem" }}>{item.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, color: textCol, fontSize: "0.88rem", margin: 0 }}>{item.name}</p>
                        <p style={{ color: text2, fontSize: "0.72rem", margin: 0 }}>{item.date}</p>
                      </div>
                      <div style={{ color: text2, fontSize: "0.85rem", fontWeight: 700, flexShrink: 0 }}>D+{diff}</div>
                      <button onClick={() => deleteItem(item.id)}
                        style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "1rem", flexShrink: 0, opacity: 0.6 }}>
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
