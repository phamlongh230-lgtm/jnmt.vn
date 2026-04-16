import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

type MealTime = "sang" | "trua" | "toi";
type DayKey = "T2" | "T3" | "T4" | "T5" | "T6" | "T7" | "CN";

const DAYS: DayKey[] = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

const MENU_DATA: Record<DayKey, Record<MealTime, string>> = {
  T2: { sang: "밥 + 된장찌개 (Cháo + canh đậu)", trua: "비빔밥 (Cơm trộn)", toi: "삼겹살 (Thịt ba chỉ nướng)" },
  T3: { sang: "죽 + 김치 (Cháo + kimchi)", trua: "김치찌개 (Canh kimchi)", toi: "불고기 (Thịt bò nướng)" },
  T4: { sang: "토스트 + 달걀 (Bánh mì + trứng)", trua: "냉면 (Mì lạnh)", toi: "순두부찌개 (Canh đậu hũ mềm)" },
  T5: { sang: "밥 + 미역국 (Cơm + canh rong biển)", trua: "볶음밥 (Cơm chiên)", toi: "삼계탕 (Gà hầm sâm)" },
  T6: { sang: "빵 + 우유 (Bánh mì + sữa)", trua: "떡볶이 (Bánh gạo cay)", toi: "갈비탕 (Canh sườn bò)" },
  T7: { sang: "밥 + 두부조림 (Cơm + đậu hũ kho)", trua: "잡채 (Miến trộn)", toi: "LA갈비 (Sườn nướng LA)" },
  CN: { sang: "팬케이크 + 시럽 (Bánh pancake)", trua: "부대찌개 (Lẩu thập cẩm)", toi: "삼겹살 파티 (Tiệc thịt ba chỉ)" },
};

const MEAL_KEY: Record<MealTime, string> = { sang: "meal_morning", trua: "meal_noon", toi: "meal_night" };
const MEAL_ICON: Record<MealTime, string> = { sang: "🌅", trua: "☀️", toi: "🌙" };

export default function MenuPage() {
  const { isDark, lang } = useApp();
  const [meal, setMeal] = useState<MealTime>("trua");
  const today = new Date().getDay();
  const todayKey = today === 0 ? "CN" : today === 6 ? "T7" : (["T2", "T3", "T4", "T5", "T6"][today - 1] as DayKey);
  const [selectedDay, setSelectedDay] = useState<DayKey>(todayKey);

  const bg = isDark ? "#1a1a2e" : "#f0f4ff";
  const text = isDark ? "#e0e0e0" : "#333";
  const sub = isDark ? "#888" : "#666";
  const border = isDark ? "#2d2d4e" : "#e0e0e0";
  const accent = "#4361ee";

  return (
    <div style={{ minHeight: "100vh", background: bg, padding: "20px 16px 80px" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <h2 style={{ color: text, fontSize: 20, fontWeight: 700, marginBottom: 4 }}>🍱 {t(lang, "menu_title")}</h2>
        <p style={{ color: sub, fontSize: 13, marginBottom: 20 }}>{t(lang, "menu_subtitle")}</p>

        <div style={{ display: "flex", gap: 6, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
          {DAYS.map(d => (
            <button key={d} onClick={() => setSelectedDay(d)} style={{
              padding: "8px 14px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700,
              background: selectedDay === d ? accent : (isDark ? "#2d2d4e" : "#e8edf5"),
              color: selectedDay === d ? "#fff" : text, flexShrink: 0,
              outline: d === todayKey ? `2px solid ${accent}` : "none",
            }}>
              {d}{d === todayKey ? " ●" : ""}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {(["sang", "trua", "toi"] as MealTime[]).map(m => (
            <button key={m} onClick={() => setMeal(m)} style={{
              flex: 1, padding: "10px", borderRadius: 10, border: `2px solid ${meal === m ? accent : border}`,
              background: meal === m ? accent : "transparent", color: meal === m ? "#fff" : text,
              cursor: "pointer", fontSize: 14, fontWeight: 600,
            }}>
              {MEAL_ICON[m]} {t(lang, MEAL_KEY[m])}
            </button>
          ))}
        </div>

        <div className="glass" style={{ borderRadius: 22, padding: 24 }}>
          <p style={{ color: sub, fontSize: 13, marginBottom: 8 }}>{selectedDay} - {t(lang, MEAL_KEY[meal])}</p>
          <p style={{ color: text, fontSize: 20, fontWeight: 700, lineHeight: 1.5, margin: 0 }}>
            {MENU_DATA[selectedDay][meal]}
          </p>
        </div>

        <div className="glass" style={{ marginTop: 16, borderRadius: 22, padding: 16 }}>
          <p style={{ color: text, fontSize: 14, fontWeight: 700, marginBottom: 12 }}>{t(lang, "weekly_menu_all")} — {t(lang, MEAL_KEY[meal])}</p>
          {DAYS.map(d => (
            <div key={d} style={{ padding: "10px 0", borderBottom: `1px solid ${border}`, display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ color: d === selectedDay ? accent : sub, fontWeight: 700, fontSize: 13, minWidth: 24 }}>{d}</span>
              <span style={{ color: text, fontSize: 14 }}>{MENU_DATA[d][meal]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
