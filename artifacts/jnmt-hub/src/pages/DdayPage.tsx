import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

function tN(template: string, n: number): string {
  return template.replace("{n}", String(n));
}

interface DdayItem {
  id: string;
  name: string;
  date: string;
  icon: string;
}

const ICONS = ["📝", "🎯", "✈️", "🏖️", "🎓", "💼", "❤️", "⭐", "🎂", "🏆"];

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
  const [showAdd, setShowAdd] = useState(false);

  const bg = isDark ? "#1a1a2e" : "#f0f4ff";
  const text = isDark ? "#e0e0e0" : "#333";
  const sub = isDark ? "#888" : "#666";
  const border = isDark ? "#2d2d4e" : "#e0e0e0";
  const accent = "#4361ee";

  useEffect(() => {
    const saved = localStorage.getItem("jnmt_dday");
    if (saved) setItems(JSON.parse(saved));
  }, []);

  function save(newItems: DdayItem[]) {
    const sorted = [...newItems].sort((a, b) => Math.abs(diffDays(a.date)) - Math.abs(diffDays(b.date)));
    setItems(sorted);
    localStorage.setItem("jnmt_dday", JSON.stringify(sorted));
  }

  function addItem() {
    if (!name.trim() || !date) return;
    save([...items, { id: Date.now().toString(), name, date, icon }]);
    setName(""); setDate(""); setIcon("📝");
    setShowAdd(false);
  }

  function deleteItem(id: string) {
    save(items.filter(i => i.id !== id));
  }

  return (
    <div style={{ minHeight: "100vh", background: bg, padding: "20px 16px 80px" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <h2 style={{ color: text, fontSize: 20, fontWeight: 700, margin: 0 }}>⏳ D-Day</h2>
          <button onClick={() => setShowAdd(s => !s)} style={{ padding: "8px 14px", background: accent, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            {t(lang, "add_dday_btn")}
          </button>
        </div>
        <p style={{ color: sub, fontSize: 13, marginBottom: 16 }}>{t(lang, "dday_subtitle")}</p>

        {showAdd && (
          <div className="glass" style={{ borderRadius: 22, padding: 16, marginBottom: 16 }}>
            <input value={name} onChange={e => setName(e.target.value)} placeholder={t(lang, "event_name")} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${border}`, background: bg, color: text, fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 8 }} />
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${border}`, background: bg, color: text, fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 12 }} />
            <p style={{ color: sub, fontSize: 13, marginBottom: 8 }}>{t(lang, "choose_icon")}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
              {ICONS.map(ic => (
                <button key={ic} onClick={() => setIcon(ic)} style={{ fontSize: 24, background: icon === ic ? accent : "transparent", border: icon === ic ? "none" : `1px solid ${border}`, borderRadius: 8, padding: "4px 8px", cursor: "pointer" }}>
                  {ic}
                </button>
              ))}
            </div>
            <button onClick={addItem} style={{ width: "100%", padding: "11px", background: accent, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              {t(lang, "add_event_btn")}
            </button>
          </div>
        )}

        {items.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 60, color: sub }}>
            <div style={{ fontSize: 40 }}>📅</div>
            <p style={{ marginTop: 8 }}>{t(lang, "no_events")}</p>
          </div>
        ) : (
          items.map(item => {
            const diff = diffDays(item.date);
            const isPast = diff < 0;
            const isToday = diff === 0;
            const color = isToday ? "#f59e0b" : isPast ? sub : accent;

            return (
              <div key={item.id} className="glass" style={{ borderRadius: 14, padding: 16, marginBottom: 10, display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ fontSize: 36 }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: text, fontWeight: 700, fontSize: 16, margin: "0 0 2px" }}>{item.name}</p>
                  <p style={{ color: sub, fontSize: 12, margin: 0 }}>{item.date}</p>
                  <p style={{ color, fontSize: 18, fontWeight: 800, margin: "4px 0 0" }}>
                    {isToday ? t(lang, "today") : isPast ? tN(t(lang, "days_ago"), Math.abs(diff)) : tN(t(lang, "days_left"), diff)}
                  </p>
                </div>
                <button onClick={() => deleteItem(item.id)} style={{ background: "none", border: "none", color: "#e53e3e", cursor: "pointer", fontSize: 20 }}>×</button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
