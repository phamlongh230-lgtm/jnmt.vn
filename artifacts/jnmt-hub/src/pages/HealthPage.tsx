import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

interface BodyPart {
  id: string;
  labelVi: string;
  labelKo: string;
  symptoms: string;
  symptomsKo: string;
  advice: string;
  adviceKo: string;
  emoji: string;
  color: string;
  urgent?: boolean;
}

const BODY_PARTS: BodyPart[] = [
  { id: "head", labelVi: "Đầu / Não", labelKo: "머리", symptoms: "Đau đầu, chóng mặt, nhức nửa đầu", symptomsKo: "두통, 어지러움, 편두통", advice: "Nghỉ ngơi, uống nước, tránh ánh sáng mạnh. Nếu kéo dài hơn 24h, đến gặp bác sĩ.", adviceKo: "휴식, 수분 섭취, 강한 빛 피하기. 24시간 이상 지속되면 병원 방문.", emoji: "🧠", color: "#7c3aed" },
  { id: "eye", labelVi: "Mắt", labelKo: "눈", symptoms: "Đỏ mắt, ngứa, đau, mờ nhìn", symptomsKo: "충혈, 가려움, 통증, 시야 흐림", advice: "Không dụi mắt. Rửa bằng nước sạch. Nếu không cải thiện sau 1 ngày, đến khám.", adviceKo: "눈 비비지 말 것. 깨끗한 물로 세척. 1일 후에도 개선 없으면 진료받기.", emoji: "👁️", color: "#0891b2" },
  { id: "throat", labelVi: "Họng / Cổ", labelKo: "목", symptoms: "Đau họng, khó nuốt, viêm họng", symptomsKo: "인후통, 삼키기 어려움, 인후염", advice: "Súc miệng nước muối ấm, uống nhiều nước, tránh thức uống lạnh.", adviceKo: "따뜻한 소금물로 가글, 충분한 수분 섭취, 찬 음료 피하기.", emoji: "🫀", color: "#0ea5e9" },
  { id: "chest", labelVi: "Ngực / Tim", labelKo: "가슴/심장", symptoms: "Đau ngực, khó thở, tim đập nhanh", symptomsKo: "흉통, 호흡 곤란, 빠른 심박동", advice: "⚠️ KHẨN CẤP: Nếu đau ngực dữ dội, gọi 119 ngay lập tức!", adviceKo: "⚠️ 긴급: 심한 흉통시 즉시 119에 전화!", emoji: "❤️", color: "#dc2626", urgent: true },
  { id: "stomach", labelVi: "Bụng / Dạ dày", labelKo: "배/위", symptoms: "Đau bụng, buồn nôn, tiêu chảy, khó tiêu", symptomsKo: "복통, 메스꺼움, 설사, 소화 불량", advice: "Uống nhiều nước, ăn nhẹ (cháo, bánh mì), tránh đồ cay và dầu mỡ.", adviceKo: "수분 보충, 가벼운 음식(죽, 빵) 섭취, 매운 음식과 기름진 음식 피하기.", emoji: "🫁", color: "#f97316" },
  { id: "back", labelVi: "Lưng", labelKo: "허리", symptoms: "Đau lưng, căng cơ, khó vận động", symptomsKo: "요통, 근육 긴장, 움직임 어려움", advice: "Nghỉ ngơi, chườm ấm/lạnh. Không nằm quá lâu. Nhẹ nhàng vận động.", adviceKo: "휴식, 온냉 찜질. 너무 오래 누워있지 말 것. 가벼운 운동.", emoji: "🦴", color: "#d97706" },
  { id: "arm", labelVi: "Tay / Cánh tay", labelKo: "팔", symptoms: "Đau, tê, sưng, bong gân", symptomsKo: "통증, 저림, 부종, 염좌", advice: "Nghỉ ngơi, chườm đá (20 phút), băng nhẹ nếu bong gân nhẹ.", adviceKo: "휴식, 얼음 찜질(20분), 가벼운 염좌면 붕대 감기.", emoji: "💪", color: "#059669" },
  { id: "leg", labelVi: "Chân", labelKo: "다리", symptoms: "Đau chân, chuột rút, sưng, bong gân", symptomsKo: "다리 통증, 근육 경련, 부종, 염좌", advice: "Kê cao chân, chườm đá. Với chuột rút: kéo căng cơ bắp chân.", adviceKo: "다리 높이기, 얼음 찜질. 근육 경련시: 종아리 근육 스트레칭.", emoji: "🦵", color: "#2563eb" },
  { id: "fever", labelVi: "Sốt / Toàn thân", labelKo: "발열/전신", symptoms: "Sốt, ớn lạnh, mệt mỏi toàn thân, cúm", symptomsKo: "발열, 오한, 전신 피로, 독감", advice: "Nghỉ ngơi đủ giấc, uống nhiều nước, có thể dùng thuốc hạ sốt (Tylenol). Nếu sốt >39°C, đến bệnh viện.", adviceKo: "충분한 휴식, 수분 섭취, 해열제(타이레놀) 복용 가능. 39°C 이상이면 병원 방문.", emoji: "🌡️", color: "#ec4899" },
];

const EMERGENCY = [
  { icon: "🚑", nameVi: "Cấp cứu", nameKo: "응급실", number: "119", color: "#dc2626" },
  { icon: "👮", nameVi: "Cảnh sát", nameKo: "경찰", number: "112", color: "#2563eb" },
  { icon: "🏥", nameVi: "Y tế nước ngoài", nameKo: "외국인 의료", number: "1339", color: "#059669" },
  { icon: "📞", nameVi: "Hỗ trợ du lịch", nameKo: "외국인 지원", number: "1330", color: "#d97706" },
];

export default function HealthPage() {
  const { isDark, lang } = useApp();
  const [selected, setSelected] = useState<BodyPart | null>(null);
  const [showKo, setShowKo] = useState(false);

  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const text2   = isDark ? "#94a3b8" : "#64748b";
  const border  = isDark ? "#334155" : "#e2e8f0";

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem 1rem" }} className="animate-fade-in">

      {/* Header */}
      <div className="glass" style={{ borderRadius: 22, padding: "1.25rem 1.5rem", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#dc2626", display: "flex", alignItems: "center", gap: "0.5rem", margin: 0 }}>
              ❤️ {t(lang, "health_title")}
            </h2>
            <p style={{ color: text2, fontSize: "0.82rem", marginTop: "0.2rem", marginBottom: 0 }}>{t(lang, "health_subtitle")}</p>
          </div>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            {[false, true].map(ko => (
              <button key={String(ko)} onClick={() => setShowKo(ko)}
                style={{ padding: "0.45rem 0.9rem", borderRadius: 100, border: `1.5px solid ${showKo === ko ? "#2563eb" : border}`, background: showKo === ko ? "#2563eb" : "transparent", color: showKo === ko ? "white" : textCol, cursor: "pointer", fontSize: "0.82rem", fontWeight: showKo === ko ? 700 : 400 }}>
                {ko ? "한국어" : t(lang, "lang_vi_btn")}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem", marginBottom: "1.25rem" }}>
        {/* Body parts grid */}
        <div className="glass" style={{ borderRadius: 22, padding: "1.25rem" }}>
          <h3 style={{ fontSize: "0.88rem", fontWeight: 700, color: textCol, marginBottom: "0.85rem" }}>
            🩺 Chọn bộ phận bị đau
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            {BODY_PARTS.map(part => {
              const isActive = selected?.id === part.id;
              return (
                <button key={part.id} onClick={() => setSelected(isActive ? null : part)}
                  style={{ padding: "0.75rem 0.65rem", borderRadius: 12, border: `1.5px solid ${isActive ? part.color : border}`, background: isActive ? part.color + (isDark ? "33" : "18") : "transparent", cursor: "pointer", textAlign: "left", transition: "all 0.15s", position: "relative" }}>
                  {part.urgent && (
                    <span style={{ position: "absolute", top: 4, right: 4, width: 7, height: 7, background: "#dc2626", borderRadius: "50%" }} />
                  )}
                  <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>{part.emoji}</div>
                  <div style={{ fontSize: "0.78rem", fontWeight: 700, color: isActive ? part.color : textCol, lineHeight: 1.3 }}>
                    {showKo ? part.labelKo : part.labelVi}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Info panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {selected ? (
            <div className="glass" style={{ borderRadius: 22, padding: "1.25rem", borderLeft: `4px solid ${selected.color}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                <span style={{ fontSize: "2.2rem" }}>{selected.emoji}</span>
                <div>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: selected.color, margin: 0 }}>
                    {showKo ? selected.labelKo : selected.labelVi}
                  </h3>
                  {selected.urgent && (
                    <span style={{ fontSize: "0.68rem", background: "#dc2626", color: "white", padding: "0.1rem 0.45rem", borderRadius: 6, fontWeight: 700 }}>⚠️ CẤP CỨU / 긴급</span>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: "0.85rem" }}>
                <p style={{ fontSize: "0.72rem", fontWeight: 700, color: text2, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: "0.35rem" }}>
                  {showKo ? "주요 증상" : t(lang, "symptoms_common")}
                </p>
                <p style={{ fontSize: "0.88rem", color: textCol, lineHeight: 1.6, margin: 0 }}>
                  {showKo ? selected.symptomsKo : selected.symptoms}
                </p>
              </div>

              <div style={{ background: isDark ? "#0f2e1b" : "#f0fdf4", borderRadius: 12, padding: "0.85rem 1rem", borderLeft: `3px solid #10b981` }}>
                <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: "0.35rem" }}>
                  {showKo ? "💡 조언" : `💡 ${t(lang, "advice")}`}
                </p>
                <p style={{ fontSize: "0.88rem", color: textCol, lineHeight: 1.6, margin: 0 }}>
                  {showKo ? selected.adviceKo : selected.advice}
                </p>
              </div>
            </div>
          ) : (
            <div className="glass" style={{ borderRadius: 22, padding: "2rem", textAlign: "center", opacity: 0.7 }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>👈</div>
              <p style={{ color: text2, fontSize: "0.88rem" }}>Chọn bộ phận để xem triệu chứng và lời khuyên</p>
            </div>
          )}

          {/* Emergency */}
          <div className="glass" style={{ borderRadius: 22, padding: "1.1rem 1.25rem" }}>
            <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#dc2626", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              🚨 {showKo ? "긴급 연락처" : t(lang, "emergency_numbers")}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
              {EMERGENCY.map(e => (
                <a key={e.number} href={`tel:${e.number}`}
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 0.75rem", background: e.color + (isDark ? "22" : "12"), borderRadius: 10, textDecoration: "none", border: `1px solid ${e.color}30` }}>
                  <span style={{ fontSize: "1.3rem" }}>{e.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.72rem", color: textCol, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{showKo ? e.nameKo : e.nameVi}</div>
                    <div style={{ fontSize: "0.9rem", fontWeight: 900, color: e.color }}>{e.number}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
