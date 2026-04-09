import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

interface ClassItem {
  time: string;
  s: string;
  r: string;
  c: string;
}

const SCHEDULE_DATA: { day: string; dayShort: string; classes: ClassItem[] }[] = [
  {
    day: "Thứ Hai", dayShort: "월",
    classes: [
      { time: "08:50", s: "자율 (Tự học)", r: "", c: "#94a3b8" },
      { time: "09:50", s: "국어 (Ngữ văn)", r: "", c: "#0ea5e9" },
      { time: "10:50", s: "영어 (Tiếng Anh)", r: "", c: "#8b5cf6" },
      { time: "11:50", s: "수학 (Toán)", r: "", c: "#2563eb" },
      { time: "13:40", s: "한국어 (Tiếng Hàn)", r: "", c: "#0ea5e9" },
      { time: "14:40", s: "한국어 (Tiếng Hàn)", r: "", c: "#0ea5e9" },
      { time: "15:40", s: "기계 (Kỹ thuật)", r: "", c: "#10b981" },
    ],
  },
  {
    day: "Thứ Ba", dayShort: "화",
    classes: [
      { time: "08:50", s: "디지털과 (KT số)", r: "", c: "#f97316" },
      { time: "09:50", s: "기계 (Kỹ thuật)", r: "", c: "#10b981" },
      { time: "10:50", s: "한국어 (Tiếng Hàn)", r: "", c: "#0ea5e9" },
      { time: "11:50", s: "수학 (Toán)", r: "", c: "#2563eb" },
      { time: "13:40", s: "국어 (Ngữ văn)", r: "", c: "#0ea5e9" },
      { time: "14:40", s: "체육 (Thể dục)", r: "Sân", c: "#ef4444" },
      { time: "15:40", s: "한국어 (Tiếng Hàn)", r: "", c: "#0ea5e9" },
    ],
  },
  {
    day: "Thứ Tư", dayShort: "수",
    classes: [
      { time: "08:50", s: "수학 (Toán)", r: "", c: "#2563eb" },
      { time: "09:50", s: "디지털과 (KT số)", r: "", c: "#f97316" },
      { time: "10:50", s: "체육 (Thể dục)", r: "Sân", c: "#ef4444" },
      { time: "11:50", s: "기계 (Kỹ thuật)", r: "", c: "#10b981" },
      { time: "13:40", s: "한국어 (Tiếng Hàn)", r: "", c: "#0ea5e9" },
      { time: "14:40", s: "동아리 (CLB)", r: "", c: "#ec4899" },
    ],
  },
  {
    day: "Thứ Năm", dayShort: "목",
    classes: [
      { time: "08:50", s: "기계 (Kỹ thuật)", r: "", c: "#10b981" },
      { time: "09:50", s: "한국어 (Tiếng Hàn)", r: "", c: "#0ea5e9" },
      { time: "10:50", s: "체육 (Thể dục)", r: "Sân", c: "#ef4444" },
      { time: "11:50", s: "한국어 (Tiếng Hàn)", r: "", c: "#0ea5e9" },
      { time: "13:40", s: "국어 (Ngữ văn)", r: "", c: "#0ea5e9" },
      { time: "14:40", s: "영어 (Tiếng Anh)", r: "", c: "#8b5cf6" },
      { time: "15:40", s: "진로 (Hướng nghiệp)", r: "", c: "#d97706" },
    ],
  },
  {
    day: "Thứ Sáu", dayShort: "금",
    classes: [
      { time: "08:50", s: "디지털과 (KT số)", r: "", c: "#f97316" },
      { time: "09:50", s: "영어 (Tiếng Anh)", r: "", c: "#8b5cf6" },
      { time: "10:50", s: "국어 (Ngữ văn)", r: "", c: "#0ea5e9" },
      { time: "11:50", s: "한국어 (Tiếng Hàn)", r: "", c: "#0ea5e9" },
      { time: "13:40", s: "디지털과 (KT số)", r: "", c: "#f97316" },
    ],
  },
];

function isCurrentClass(timeStr: string, isToday: boolean): boolean {
  if (!isToday) return false;
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const [h, m] = timeStr.split(":").map(Number);
  const itemMin = h * 60 + m;
  return Math.abs(itemMin - nowMin) < 50;
}

export default function SchedulePage() {
  const { lang, isDark } = useApp();

  const border = isDark ? "#334155" : "#e2e8f0";
  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const text2 = isDark ? "#94a3b8" : "#64748b";
  const cardBg = isDark ? "#1e293b" : "white";
  const rowBg = isDark ? "#0f172a" : "#f8fafc";
  const nowBg = isDark ? "#1e3a5f" : "#eff6ff";

  const today = new Date();
  const jsDay = today.getDay();
  const todayIdx = jsDay >= 1 && jsDay <= 5 ? jsDay - 1 : -1;
  const todayData = todayIdx >= 0 ? SCHEDULE_DATA[todayIdx] : null;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem 1rem" }} className="animate-fade-in">
      {/* Today's schedule */}
      <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 16, padding: "1.5rem", marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#2563eb", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
          📅 {t(lang, "schedule")}
        </h2>
        <p style={{ color: text2, fontSize: "0.85rem", marginBottom: "1.25rem" }}>
          {todayData ? todayData.day : "Chủ nhật"} — {today.toLocaleDateString("vi-VN")}
        </p>

        {todayData ? (
          <>
            <div style={{ fontWeight: 700, color: textCol, marginBottom: "0.75rem", fontSize: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              📋 Lịch hôm nay — {todayData.day}
              <span style={{ background: "#dbeafe", color: "#1d4ed8", padding: "0.15rem 0.6rem", borderRadius: 20, fontSize: "0.75rem" }}>
                {todayData.dayShort}요일
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {todayData.classes.map((cls, idx) => {
                const isCurrent = isCurrentClass(cls.time, true);
                return (
                  <div
                    key={idx}
                    style={{
                      padding: "0.85rem 1rem",
                      background: isCurrent ? nowBg : rowBg,
                      border: `1px solid ${isCurrent ? "#93c5fd" : border}`,
                      borderRadius: 10,
                      borderLeft: `4px solid ${cls.c}`,
                      position: "relative",
                      boxShadow: isCurrent ? "0 0 0 2px rgba(37,99,235,0.15)" : "none",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: cls.c, flexShrink: 0 }} />
                        <span style={{ fontWeight: 700, color: textCol, fontSize: "0.95rem" }}>{cls.s}</span>
                        {cls.r && <span style={{ fontSize: "0.8rem", color: text2 }}>📍 {cls.r}</span>}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        {isCurrent && (
                          <span style={{ background: "#2563eb", color: "white", padding: "0.15rem 0.65rem", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700 }}>
                            🔴 Đang học
                          </span>
                        )}
                        <span style={{ fontWeight: 700, color: cls.c, fontSize: "0.9rem", fontFamily: "monospace" }}>
                          {cls.time}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "3rem", color: text2 }}>
            <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🎉</div>
            <p style={{ fontSize: "1rem", fontWeight: 600 }}>Hôm nay không có lịch học!</p>
            <p style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>Chúc bạn nghỉ ngơi vui vẻ 😊</p>
          </div>
        )}
      </div>

      {/* Full week */}
      <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 16, padding: "1.5rem" }}>
        <h3 style={{ fontWeight: 700, color: textCol, marginBottom: "1rem", fontSize: "1rem" }}>
          📆 Thời khóa biểu cả tuần
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: "1rem" }}>
          {SCHEDULE_DATA.map((day, di) => (
            <div key={day.day} style={{ border: `1px solid ${border}`, borderRadius: 12, overflow: "hidden" }}>
              <div style={{
                background: di === todayIdx ? "#2563eb" : isDark ? "#334155" : "#f1f5f9",
                padding: "0.65rem 0.9rem",
                fontWeight: 700,
                color: di === todayIdx ? "white" : textCol,
                fontSize: "0.9rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <span>{day.day} {di === todayIdx ? "🌟" : ""}</span>
                <span style={{
                  background: di === todayIdx ? "rgba(255,255,255,0.25)" : isDark ? "#1e293b" : "#e2e8f0",
                  padding: "0.1rem 0.5rem",
                  borderRadius: 10,
                  fontSize: "0.78rem",
                  fontWeight: 600,
                }}>
                  {day.dayShort}
                </span>
              </div>
              <div style={{ padding: "0.5rem" }}>
                {day.classes.map((cls, ci) => {
                  const isCurrent = isCurrentClass(cls.time, di === todayIdx);
                  return (
                    <div
                      key={ci}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.45rem",
                        padding: "0.35rem 0.5rem",
                        borderLeft: `3px solid ${cls.c}`,
                        marginBottom: "0.3rem",
                        borderRadius: 4,
                        background: isCurrent ? nowBg : rowBg,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.82rem", fontWeight: 600, color: textCol, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {isCurrent && "🔴 "}{cls.s}
                        </div>
                        <div style={{ fontSize: "0.72rem", color: text2, fontFamily: "monospace" }}>
                          {cls.time}{cls.r ? ` · 📍 ${cls.r}` : ""}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
