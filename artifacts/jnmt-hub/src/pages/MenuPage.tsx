import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

type MealTime = "sang" | "trua" | "toi";
type DayKey = "T2" | "T3" | "T4" | "T5" | "T6" | "T7" | "CN";

const DAYS: { key: DayKey; labelVi: string; labelKo: string }[] = [
  { key: "T2", labelVi: "T2", labelKo: "월" },
  { key: "T3", labelVi: "T3", labelKo: "화" },
  { key: "T4", labelVi: "T4", labelKo: "수" },
  { key: "T5", labelVi: "T5", labelKo: "목" },
  { key: "T6", labelVi: "T6", labelKo: "금" },
  { key: "T7", labelVi: "T7", labelKo: "토" },
  { key: "CN", labelVi: "CN", labelKo: "일" },
];

const MENU_DATA: Record<DayKey, Record<MealTime, { ko: string; vi: string; cal?: number }>> = {
  T2: {
    sang: { ko: "밥 + 된장찌개", vi: "Cơm + canh đậu tương", cal: 520 },
    trua: { ko: "비빔밥", vi: "Cơm trộn bibimbap", cal: 650 },
    toi: { ko: "삼겹살 + 쌈채소", vi: "Ba chỉ nướng + rau cuốn", cal: 780 },
  },
  T3: {
    sang: { ko: "죽 + 김치", vi: "Cháo + kimchi", cal: 380 },
    trua: { ko: "김치찌개 + 밥", vi: "Canh kimchi + cơm", cal: 600 },
    toi: { ko: "불고기 + 밥", vi: "Bò nướng bulgogi + cơm", cal: 720 },
  },
  T4: {
    sang: { ko: "토스트 + 달걀 프라이", vi: "Bánh mì + trứng ốp la", cal: 460 },
    trua: { ko: "냉면", vi: "Mì lạnh naengmyeon", cal: 580 },
    toi: { ko: "순두부찌개 + 밥", vi: "Canh đậu hũ non + cơm", cal: 560 },
  },
  T5: {
    sang: { ko: "밥 + 미역국", vi: "Cơm + canh rong biển", cal: 490 },
    trua: { ko: "볶음밥", vi: "Cơm chiên bokkeumbap", cal: 640 },
    toi: { ko: "삼계탕", vi: "Gà hầm nhân sâm", cal: 680 },
  },
  T6: {
    sang: { ko: "빵 + 우유", vi: "Bánh mì + sữa", cal: 340 },
    trua: { ko: "떡볶이 + 순대", vi: "Tteokbokki + sundae", cal: 700 },
    toi: { ko: "갈비탕", vi: "Canh sườn bò", cal: 660 },
  },
  T7: {
    sang: { ko: "밥 + 두부조림", vi: "Cơm + đậu hũ kho", cal: 510 },
    trua: { ko: "잡채 + 밥", vi: "Miến trộn + cơm", cal: 590 },
    toi: { ko: "LA갈비", vi: "Sườn nướng LA", cal: 810 },
  },
  CN: {
    sang: { ko: "팬케이크 + 시럽", vi: "Bánh pancake + siro", cal: 520 },
    trua: { ko: "부대찌개", vi: "Lẩu thập cẩm budaejjigae", cal: 730 },
    toi: { ko: "삼겹살 파티", vi: "Tiệc ba chỉ nướng", cal: 900 },
  },
};

const MEAL_CONFIG: { key: MealTime; tKey: string; icon: string; time: string; color: string }[] = [
  { key: "sang", tKey: "meal_morning", icon: "🌅", time: "07:00", color: "#f59e0b" },
  { key: "trua", tKey: "meal_noon", icon: "☀️", time: "12:00", color: "#2563eb" },
  { key: "toi", tKey: "meal_night", icon: "🌙", time: "18:00", color: "#7c3aed" },
];

function calBar(cal: number) {
  const max = 900;
  const pct = Math.min(100, Math.round((cal / max) * 100));
  const color = cal < 500 ? "#10b981" : cal < 700 ? "#f59e0b" : "#ef4444";
  return { pct, color };
}

export default function MenuPage() {
  const { isDark, lang } = useApp();
  const [meal, setMeal] = useState<MealTime>("trua");
  const today = new Date().getDay();
  const todayKey: DayKey = today === 0 ? "CN" : today === 6 ? "T7" : (["T2", "T3", "T4", "T5", "T6"][today - 1] as DayKey);
  const [selectedDay, setSelectedDay] = useState<DayKey>(todayKey);

  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const text2   = isDark ? "#94a3b8" : "#64748b";
  const border  = isDark ? "#334155" : "#e2e8f0";

  const activeMeal = MEAL_CONFIG.find(m => m.key === meal)!;
  const currentMenu = MENU_DATA[selectedDay][meal];
  const { pct, color: calColor } = calBar(currentMenu.cal ?? 0);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem 1rem" }} className="animate-fade-in">

      {/* Header */}
      <div className="glass" style={{ borderRadius: 22, padding: "1.25rem 1.5rem", marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#2563eb", display: "flex", alignItems: "center", gap: "0.5rem", margin: 0 }}>
          🍱 {t(lang, "menu_title")}
        </h2>
        <p style={{ color: text2, fontSize: "0.82rem", marginTop: "0.2rem", marginBottom: "1rem" }}>
          {t(lang, "menu_subtitle")}
        </p>

        {/* Day tabs */}
        <div style={{ display: "flex", gap: "0.35rem", overflowX: "auto", paddingBottom: 2 }}>
          {DAYS.map(d => {
            const isActive = selectedDay === d.key;
            const isToday = d.key === todayKey;
            return (
              <button key={d.key} onClick={() => setSelectedDay(d.key)}
                style={{ padding: "0.45rem 0.9rem", borderRadius: 100, border: `1.5px solid ${isActive ? "#2563eb" : border}`, cursor: "pointer", fontSize: "0.82rem", fontWeight: isActive ? 700 : 500, whiteSpace: "nowrap", background: isActive ? "#2563eb" : "transparent", color: isActive ? "white" : textCol, flexShrink: 0, position: "relative", transition: "all 0.15s" }}>
                {d.labelVi}
                {isToday && !isActive && <span style={{ position: "absolute", top: 1, right: 4, width: 5, height: 5, background: "#10b981", borderRadius: "50%" }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Meal selector */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.65rem", marginBottom: "1.25rem" }}>
        {MEAL_CONFIG.map(m => {
          const isActive = meal === m.key;
          const menuItem = MENU_DATA[selectedDay][m.key];
          return (
            <button key={m.key} onClick={() => setMeal(m.key)}
              style={{ padding: "0.85rem", borderRadius: 16, border: `1.5px solid ${isActive ? m.color : border}`, background: isActive ? (isDark ? m.color + "22" : m.color + "10") : "transparent", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
              <div style={{ fontSize: "1.4rem", marginBottom: "0.3rem" }}>{m.icon}</div>
              <div style={{ fontSize: "0.78rem", color: isActive ? m.color : text2, fontWeight: 700 }}>{m.time} · {t(lang, m.tKey)}</div>
              <div style={{ fontSize: "0.72rem", color: isActive ? textCol : text2, marginTop: "0.15rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{menuItem.vi}</div>
            </button>
          );
        })}
      </div>

      {/* Main meal card */}
      <div className="glass" style={{ borderRadius: 22, padding: "1.5rem", marginBottom: "1.25rem", borderLeft: `4px solid ${activeMeal.color}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <span style={{ fontSize: "1.5rem" }}>{activeMeal.icon}</span>
              <div>
                <div style={{ fontSize: "0.72rem", color: text2, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{selectedDay} · {t(lang, activeMeal.tKey)}</div>
                <div style={{ fontSize: "0.75rem", color: activeMeal.color, fontWeight: 700 }}>{activeMeal.time}</div>
              </div>
            </div>

            <p style={{ fontSize: "1.4rem", fontWeight: 900, color: textCol, margin: "0 0 0.4rem", lineHeight: 1.3 }}>
              {currentMenu.ko}
            </p>
            <p style={{ fontSize: "0.95rem", color: text2, margin: 0 }}>
              {currentMenu.vi}
            </p>
          </div>

          {currentMenu.cal && (
            <div style={{ textAlign: "center", background: isDark ? "#0f172a" : "#f8fafc", borderRadius: 14, padding: "0.85rem 1.25rem", border: `1px solid ${border}`, flexShrink: 0 }}>
              <div style={{ fontSize: "1.6rem", fontWeight: 900, color: calColor }}>{currentMenu.cal}</div>
              <div style={{ fontSize: "0.68rem", color: text2, fontWeight: 600 }}>kcal</div>
              <div style={{ marginTop: "0.4rem", background: isDark ? "#334155" : "#e2e8f0", borderRadius: 100, height: 4, width: 60, margin: "0.35rem auto 0" }}>
                <div style={{ height: "100%", background: calColor, borderRadius: 100, width: `${pct}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full week for selected meal */}
      <div className="glass" style={{ borderRadius: 22, padding: "1.5rem" }}>
        <h3 style={{ fontWeight: 700, color: textCol, marginBottom: "0.85rem", fontSize: "0.95rem" }}>
          📆 Toàn tuần — {activeMeal.icon} {t(lang, activeMeal.tKey)}
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
          {DAYS.map(d => {
            const item = MENU_DATA[d.key][meal];
            const isSelected = d.key === selectedDay;
            const isToday = d.key === todayKey;
            return (
              <button key={d.key} onClick={() => setSelectedDay(d.key)}
                style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.65rem 0.85rem", borderRadius: 12, border: `1px solid ${isSelected ? "#2563eb" : border}`, background: isSelected ? (isDark ? "#1e3a5f22" : "#eff6ff") : "transparent", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: isToday ? "#10b981" : text2, minWidth: 26 }}>
                  {d.labelKo}{isToday ? " ●" : ""}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: isSelected ? 700 : 500, color: isSelected ? "#2563eb" : textCol, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.ko}</div>
                  <div style={{ fontSize: "0.72rem", color: text2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.vi}</div>
                </div>
                {item.cal && <span style={{ fontSize: "0.72rem", color: text2, flexShrink: 0 }}>{item.cal} kcal</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
