import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

// Korean grade scale (수행평가 / 지필평가)
const gradeScale = [
  { grade: "A+", min: 95, label: "수", color: "#059669" },
  { grade: "A", min: 90, label: "우", color: "#10b981" },
  { grade: "B+", min: 85, label: "양", color: "#3b82f6" },
  { grade: "B", min: 80, label: "양", color: "#2563eb" },
  { grade: "C+", min: 75, label: "미", color: "#f59e0b" },
  { grade: "C", min: 70, label: "미", color: "#d97706" },
  { grade: "D+", min: 65, label: "가", color: "#ef4444" },
  { grade: "D", min: 60, label: "가", color: "#dc2626" },
  { grade: "F", min: 0, label: "불", color: "#9f1239" },
];

function getGrade(score: number) {
  return gradeScale.find((g) => score >= g.min) || gradeScale[gradeScale.length - 1];
}

interface Subject {
  id: number;
  name: string;
  score: string;
  credit: string;
}

export default function GPAPage() {
  const { isDark, lang } = useApp();
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: 1, name: "수학", score: "", credit: "3" },
    { id: 2, name: "영어", score: "", credit: "3" },
    { id: 3, name: "한국어", score: "", credit: "4" },
  ]);

  const cardBg = isDark ? "#1e293b" : "white";
  const border = isDark ? "#334155" : "#e2e8f0";
  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const text2 = isDark ? "#94a3b8" : "#64748b";
  const inputBg = isDark ? "#0f172a" : "#f8fafc";

  const addSubject = () => setSubjects((prev) => [...prev, { id: Date.now(), name: "", score: "", credit: "3" }]);
  const removeSubject = (id: number) => setSubjects((prev) => prev.filter((s) => s.id !== id));
  const update = (id: number, field: keyof Subject, value: string) =>
    setSubjects((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s));

  const validSubjects = subjects.filter((s) => s.score !== "" && !isNaN(parseFloat(s.score)));
  const totalCredit = validSubjects.reduce((sum, s) => sum + (parseFloat(s.credit) || 0), 0);
  const weightedSum = validSubjects.reduce((sum, s) => sum + (parseFloat(s.score) || 0) * (parseFloat(s.credit) || 0), 0);
  const avg = totalCredit > 0 ? weightedSum / totalCredit : 0;
  const avgGrade = getGrade(avg);

  return (
    <div style={{ maxWidth: 650, margin: "0 auto", padding: "1.5rem 1rem" }} className="animate-fade-in">
      <div style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)", borderRadius: 16, padding: "1.5rem", color: "white", marginBottom: "1.25rem" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 900, margin: 0, marginBottom: "0.25rem" }}>📊 Tính điểm trung bình</h1>
        <p style={{ margin: 0, opacity: 0.85, fontSize: "0.85rem" }}>Hệ thống đánh giá Hàn Quốc — 수 우 양 미 가</p>
      </div>

      {/* Result */}
      {validSubjects.length > 0 && (
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 12, padding: "1.25rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3rem", fontWeight: 900, color: avgGrade.color, lineHeight: 1 }}>{avg.toFixed(1)}</div>
            <div style={{ fontSize: "0.8rem", color: text2 }}>Điểm TB</div>
          </div>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: avgGrade.color }}>{avgGrade.grade}</div>
              <div style={{ fontSize: "0.75rem", color: text2 }}>Grade</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: avgGrade.color }}>{avgGrade.label}</div>
              <div style={{ fontSize: "0.75rem", color: text2 }}>Đánh giá</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: textCol }}>{totalCredit}</div>
              <div style={{ fontSize: "0.75rem", color: text2 }}>Tín chỉ</div>
            </div>
          </div>
        </div>
      )}

      {/* Subjects */}
      <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 12, padding: "1.25rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
          {subjects.map((s) => {
            const score = parseFloat(s.score);
            const g = !isNaN(score) && s.score !== "" ? getGrade(score) : null;
            return (
              <div key={s.id} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <input value={s.name} onChange={(e) => update(s.id, "name", e.target.value)} placeholder="Môn học" style={{ flex: 2, padding: "0.6rem 0.75rem", border: `1px solid ${border}`, borderRadius: 8, background: inputBg, color: textCol, fontSize: "0.9rem", outline: "none" }} />
                <input type="number" value={s.score} onChange={(e) => update(s.id, "score", e.target.value)} placeholder="Điểm" min={0} max={100} style={{ flex: 1, padding: "0.6rem 0.75rem", border: `1px solid ${g ? g.color : border}`, borderRadius: 8, background: inputBg, color: g ? g.color : textCol, fontSize: "0.9rem", fontWeight: 700, outline: "none" }} />
                <input type="number" value={s.credit} onChange={(e) => update(s.id, "credit", e.target.value)} placeholder="TC" min={1} max={10} style={{ width: 52, padding: "0.6rem 0.5rem", border: `1px solid ${border}`, borderRadius: 8, background: inputBg, color: textCol, fontSize: "0.9rem", outline: "none", textAlign: "center" }} />
                {g && <span style={{ fontSize: "0.8rem", fontWeight: 800, color: g.color, minWidth: 30, textAlign: "center" }}>{g.grade}</span>}
                <button onClick={() => removeSubject(s.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "1.1rem", padding: "0.3rem" }}>×</button>
              </div>
            );
          })}
        </div>
        <button onClick={addSubject} style={{ marginTop: "0.75rem", padding: "0.55rem 1rem", background: "transparent", border: `1px dashed ${border}`, borderRadius: 8, color: text2, cursor: "pointer", fontSize: "0.85rem", width: "100%" }}>
          {t(lang, "add_subject_btn")}
        </button>
      </div>

      {/* Grade scale */}
      <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 12, padding: "1rem" }}>
        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: textCol, marginBottom: "0.6rem" }}>{t(lang, "korean_grade_scale")}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
          {gradeScale.map((g) => (
            <div key={g.grade} style={{ background: g.color + "20", border: `1px solid ${g.color}40`, borderRadius: 6, padding: "0.3rem 0.6rem", fontSize: "0.75rem", color: g.color, fontWeight: 700 }}>
              {g.grade} ({g.min}+)
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
