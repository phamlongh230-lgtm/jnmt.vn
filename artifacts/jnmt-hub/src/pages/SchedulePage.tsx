import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

interface ClassItem { time: string; s: string; r: string; c: string; }

const SCHEDULE_DATA: { dayKey: string; dayShort: string; classes: ClassItem[] }[] = [
  {
    dayKey: "monday", dayShort: "월",
    classes: [
      { time: "08:50", s: "자율 (Tự học)",         r: "",    c: "#94a3b8" },
      { time: "09:50", s: "국어 (Ngữ văn)",         r: "",    c: "#0ea5e9" },
      { time: "10:50", s: "영어 (Tiếng Anh)",       r: "",    c: "#8b5cf6" },
      { time: "11:50", s: "수학 (Toán)",             r: "",    c: "#2563eb" },
      { time: "13:40", s: "한국어 (Tiếng Hàn)",     r: "",    c: "#0ea5e9" },
      { time: "14:40", s: "한국어 (Tiếng Hàn)",     r: "",    c: "#0ea5e9" },
      { time: "15:40", s: "기계 (Kỹ thuật)",        r: "",    c: "#10b981" },
    ],
  },
  {
    dayKey: "tuesday", dayShort: "화",
    classes: [
      { time: "08:50", s: "디지털과 (KT số)",       r: "",    c: "#f97316" },
      { time: "09:50", s: "기계 (Kỹ thuật)",        r: "",    c: "#10b981" },
      { time: "10:50", s: "한국어 (Tiếng Hàn)",     r: "",    c: "#0ea5e9" },
      { time: "11:50", s: "수학 (Toán)",             r: "",    c: "#2563eb" },
      { time: "13:40", s: "국어 (Ngữ văn)",         r: "",    c: "#0ea5e9" },
      { time: "14:40", s: "체육 (Thể dục)",         r: "Sân", c: "#ef4444" },
      { time: "15:40", s: "한국어 (Tiếng Hàn)",     r: "",    c: "#0ea5e9" },
    ],
  },
  {
    dayKey: "wednesday", dayShort: "수",
    classes: [
      { time: "08:50", s: "수학 (Toán)",             r: "",    c: "#2563eb" },
      { time: "09:50", s: "디지털과 (KT số)",       r: "",    c: "#f97316" },
      { time: "10:50", s: "체육 (Thể dục)",         r: "Sân", c: "#ef4444" },
      { time: "11:50", s: "기계 (Kỹ thuật)",        r: "",    c: "#10b981" },
      { time: "13:40", s: "한국어 (Tiếng Hàn)",     r: "",    c: "#0ea5e9" },
      { time: "14:40", s: "동아리 (CLB)",           r: "",    c: "#ec4899" },
    ],
  },
  {
    dayKey: "thursday", dayShort: "목",
    classes: [
      { time: "08:50", s: "기계 (Kỹ thuật)",        r: "",    c: "#10b981" },
      { time: "09:50", s: "한국어 (Tiếng Hàn)",     r: "",    c: "#0ea5e9" },
      { time: "10:50", s: "체육 (Thể dục)",         r: "Sân", c: "#ef4444" },
      { time: "11:50", s: "한국어 (Tiếng Hàn)",     r: "",    c: "#0ea5e9" },
      { time: "13:40", s: "국어 (Ngữ văn)",         r: "",    c: "#0ea5e9" },
      { time: "14:40", s: "영어 (Tiếng Anh)",       r: "",    c: "#8b5cf6" },
      { time: "15:40", s: "진로 (Hướng nghiệp)",    r: "",    c: "#d97706" },
    ],
  },
  {
    dayKey: "friday", dayShort: "금",
    classes: [
      { time: "08:50", s: "디지털과 (KT số)",       r: "",    c: "#f97316" },
      { time: "09:50", s: "영어 (Tiếng Anh)",       r: "",    c: "#8b5cf6" },
      { time: "10:50", s: "국어 (Ngữ văn)",         r: "",    c: "#0ea5e9" },
      { time: "11:50", s: "한국어 (Tiếng Hàn)",     r: "",    c: "#0ea5e9" },
      { time: "13:40", s: "디지털과 (KT số)",       r: "",    c: "#f97316" },
    ],
  },
];

/** Duration: each class = 50 min */
const CLASS_DURATION = 50;

function toMinutes(timeStr: string) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

interface ClassStatus { current: number | null; next: number | null; }

function getClassStatus(classes: ClassItem[]): ClassStatus {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  let current: number | null = null;
  let next: number | null = null;

  for (let i = 0; i < classes.length; i++) {
    const startMin = toMinutes(classes[i].time);
    const endMin = startMin + CLASS_DURATION;
    if (nowMin >= startMin && nowMin < endMin) {
      current = i;
    } else if (nowMin < startMin && next === null) {
      next = i;
    }
  }
  return { current, next };
}

function formatCountdown(targetTimeStr: string): string {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const diff = toMinutes(targetTimeStr) - nowMin;
  if (diff <= 0) return "00:00";
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h > 0) return `${h}g ${m}p`;
  return `${m} phút`;
}

export default function SchedulePage() {
  const { lang, isDark } = useApp();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const textCol  = isDark ? "#f1f5f9" : "#0f172a";
  const text2    = isDark ? "#94a3b8" : "#64748b";
  const border   = isDark ? "#334155" : "#e2e8f0";
  const rowBg    = isDark ? "#0f172a" : "#f8fafc";
  const nowBg    = isDark ? "#1e3a5f" : "#eff6ff";
  const nextBg   = isDark ? "#0f2e1b" : "#f0fdf4";

  const jsDay = now.getDay();
  const todayIdx = jsDay >= 1 && jsDay <= 5 ? jsDay - 1 : -1;
  const todayData = todayIdx >= 0 ? SCHEDULE_DATA[todayIdx] : null;
  const status = todayData ? getClassStatus(todayData.classes) : { current: null, next: null };

  // Progress bar inside current class
  function classProgress(timeStr: string): number {
    const startMin = toMinutes(timeStr);
    const nowMin = now.getHours() * 60 + now.getMinutes();
    return Math.min(100, Math.max(0, Math.round(((nowMin - startMin) / CLASS_DURATION) * 100)));
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem 1rem" }} className="animate-fade-in">

      {/* ── Countdown banner ── */}
      {todayData && (
        <div className="glass-hero" style={{ background: "rgba(37,99,235,0.55)", borderRadius: 22, padding: "1.5rem 1.75rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ fontSize: "0.78rem", opacity: 0.8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: "0.25rem" }}>
              📅 {t(lang, "schedule")} — {t(lang, todayData.dayKey)}
            </div>
            {status.current !== null ? (
              <>
                <div style={{ fontSize: "1.1rem", fontWeight: 900 }}>
                  🔴 {todayData.classes[status.current].s}
                </div>
                <div style={{ fontSize: "0.82rem", opacity: 0.85, marginTop: "0.25rem" }}>
                  {t(lang, "studying_now")} · {t(lang, "class_starts_in")}{" "}
                  {CLASS_DURATION - (now.getHours() * 60 + now.getMinutes() - toMinutes(todayData.classes[status.current].time))} {t(lang, "mins_label")} {t(lang, "next")}
                </div>
                {/* Progress bar */}
                <div style={{ marginTop: "0.75rem", background: "rgba(255,255,255,0.2)", borderRadius: 100, height: 5, width: 180 }}>
                  <div style={{ height: "100%", background: "rgba(255,255,255,0.85)", borderRadius: 100, width: `${classProgress(todayData.classes[status.current].time)}%`, transition: "width 1s linear" }} />
                </div>
              </>
            ) : status.next !== null ? (
              <>
                <div style={{ fontSize: "1.1rem", fontWeight: 900 }}>
                  ⏰ {todayData.classes[status.next].s}
                </div>
                <div style={{ fontSize: "0.82rem", opacity: 0.85, marginTop: "0.25rem" }}>
                  {t(lang, "next_class_in")} {formatCountdown(todayData.classes[status.next].time)}
                </div>
              </>
            ) : (
              <div style={{ fontSize: "1.1rem", fontWeight: 900 }}>🎉 {t(lang, "no_more_class_today")}</div>
            )}
          </div>

          {/* Clock */}
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "2.2rem", fontWeight: 900, fontFamily: "monospace", letterSpacing: 2 }}>
              {now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div style={{ fontSize: "0.78rem", opacity: 0.8 }}>
              {now.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
            </div>
          </div>
        </div>
      )}

      {/* ── Today ── */}
      <div className="glass" style={{ borderRadius: 22, padding: "1.5rem", marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#2563eb", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          📋 {t(lang, "today_schedule")}
          {todayData && (
            <span style={{ background: "#dbeafe", color: "#1d4ed8", padding: "0.1rem 0.5rem", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700 }}>
              {todayData.dayShort}요일
            </span>
          )}
        </h2>

        {todayData ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
            {todayData.classes.map((cls, idx) => {
              const isCurrent = status.current === idx;
              const isNext    = status.next === idx;
              return (
                <div key={idx} style={{
                  padding: "0.85rem 1rem",
                  background: isCurrent ? nowBg : isNext ? nextBg : rowBg,
                  border: `1px solid ${isCurrent ? "#93c5fd" : isNext ? "#86efac" : border}`,
                  borderRadius: 12, borderLeft: `4px solid ${cls.c}`,
                  boxShadow: isCurrent ? "0 0 0 2px rgba(37,99,235,0.12)" : isNext ? "0 0 0 1px rgba(16,185,129,0.12)" : "none",
                  position: "relative", overflow: "hidden",
                }}>
                  {/* Progress bar inside current class */}
                  {isCurrent && (
                    <div style={{ position: "absolute", left: 0, bottom: 0, height: 3, background: cls.c, width: `${classProgress(cls.time)}%`, borderRadius: "0 2px 0 0", transition: "width 1s linear", opacity: 0.8 }} />
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: cls.c, flexShrink: 0 }} />
                      <span style={{ fontWeight: 700, color: textCol, fontSize: "0.95rem" }}>{cls.s}</span>
                      {cls.r && <span style={{ fontSize: "0.8rem", color: text2 }}>📍 {cls.r}</span>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {isCurrent && (
                        <span style={{ background: "#2563eb", color: "white", padding: "0.15rem 0.6rem", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700 }}>
                          🔴 {t(lang, "studying_now")}
                        </span>
                      )}
                      {isNext && (
                        <span style={{ background: "#10b981", color: "white", padding: "0.15rem 0.6rem", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700 }}>
                          ⏰ {formatCountdown(cls.time)}
                        </span>
                      )}
                      <span style={{ fontWeight: 700, color: cls.c, fontSize: "0.9rem", fontFamily: "monospace" }}>{cls.time}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "3rem", color: text2 }}>
            <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🎉</div>
            <p style={{ fontSize: "1rem", fontWeight: 600 }}>{t(lang, "no_class_today")}</p>
            <p style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>{t(lang, "enjoy_rest")}</p>
          </div>
        )}
      </div>

      {/* ── Full week ── */}
      <div className="glass" style={{ borderRadius: 22, padding: "1.5rem" }}>
        <h3 style={{ fontWeight: 700, color: textCol, marginBottom: "1rem", fontSize: "1rem" }}>
          📆 {t(lang, "full_week_schedule")}
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: "1rem" }}>
          {SCHEDULE_DATA.map((day, di) => (
            <div key={day.dayKey} className="glass" style={{ borderRadius: 18, overflow: "hidden" }}>
              <div style={{
                background: di === todayIdx ? "#2563eb" : isDark ? "#334155" : "#f1f5f9",
                padding: "0.65rem 0.9rem", fontWeight: 700,
                color: di === todayIdx ? "white" : textCol, fontSize: "0.9rem",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span>{t(lang, day.dayKey)} {di === todayIdx ? "🌟" : ""}</span>
                <span style={{
                  background: di === todayIdx ? "rgba(255,255,255,0.25)" : isDark ? "#1e293b" : "#e2e8f0",
                  padding: "0.1rem 0.5rem", borderRadius: 10, fontSize: "0.78rem", fontWeight: 600,
                }}>
                  {day.dayShort}
                </span>
              </div>
              <div style={{ padding: "0.5rem" }}>
                {day.classes.map((cls, ci) => {
                  const isCur = di === todayIdx && status.current === ci;
                  const isNxt = di === todayIdx && status.next === ci;
                  return (
                    <div key={ci} style={{
                      display: "flex", alignItems: "center", gap: "0.45rem",
                      padding: "0.35rem 0.5rem",
                      borderLeft: `3px solid ${cls.c}`, marginBottom: "0.3rem", borderRadius: 4,
                      background: isCur ? nowBg : isNxt ? nextBg : rowBg,
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.82rem", fontWeight: 600, color: textCol, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {isCur ? "🔴 " : isNxt ? "⏰ " : ""}{cls.s}
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
