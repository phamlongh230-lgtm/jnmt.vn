import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

interface BodyPart {
  id: string;
  label: string;
  labelKo: string;
  symptoms: string;
  symptomsKo: string;
  advice: string;
  adviceKo: string;
  top: string;
  left: string;
  emoji: string;
}

const BODY_PARTS: BodyPart[] = [
  { id: "head", label: "Đầu / Não", labelKo: "머리", symptoms: "Đau đầu, chóng mặt, nhức nửa đầu", symptomsKo: "두통, 어지러움, 편두통", advice: "Nghỉ ngơi, uống nước, tránh ánh sáng mạnh. Nếu kéo dài hơn 24h, đến gặp bác sĩ.", adviceKo: "휴식, 수분 섭취, 강한 빛 피하기. 24시간 이상 지속되면 병원 방문.", top: "2%", left: "42%", emoji: "🧠" },
  { id: "eye", label: "Mắt", labelKo: "눈", symptoms: "Đỏ mắt, ngứa, đau, mờ nhìn", symptomsKo: "충혈, 가려움, 통증, 시야 흐림", advice: "Không dụi mắt. Rửa bằng nước sạch. Nếu không cải thiện sau 1 ngày, đến khám.", adviceKo: "눈 비비지 말 것. 깨끗한 물로 세척. 1일 후에도 개선 없으면 진료받기.", top: "8%", left: "36%", emoji: "👁️" },
  { id: "throat", label: "Họng / Cổ", labelKo: "목", symptoms: "Đau họng, khó nuốt, viêm họng", symptomsKo: "인후통, 삼키기 어려움, 인후염", advice: "Súc miệng nước muối ấm, uống nhiều nước, tránh thức uống lạnh.", adviceKo: "따뜻한 소금물로 가글, 충분한 수분 섭취, 찬 음료 피하기.", top: "18%", left: "42%", emoji: "🦷" },
  { id: "chest", label: "Ngực / Tim", labelKo: "가슴/심장", symptoms: "Đau ngực, khó thở, tim đập nhanh", symptomsKo: "흉통, 호흡 곤란, 빠른 심박동", advice: "⚠️ KHẨN CẤP: Nếu đau ngực dữ dội, gọi 119 ngay lập tức!", adviceKo: "⚠️ 긴급: 심한 흉통시 즉시 119에 전화!", top: "32%", left: "42%", emoji: "❤️" },
  { id: "stomach", label: "Bụng / Dạ dày", labelKo: "배/위", symptoms: "Đau bụng, buồn nôn, tiêu chảy, khó tiêu", symptomsKo: "복통, 메스꺼움, 설사, 소화 불량", advice: "Uống nhiều nước, ăn nhẹ (cháo, bánh mì), tránh đồ cay và dầu mỡ.", adviceKo: "수분 보충, 가벼운 음식(죽, 빵) 섭취, 매운 음식과 기름진 음식 피하기.", top: "46%", left: "42%", emoji: "🫁" },
  { id: "back", label: "Lưng", labelKo: "허리", symptoms: "Đau lưng, căng cơ, khó vận động", symptomsKo: "요통, 근육 긴장, 움직임 어려움", advice: "Nghỉ ngơi, chườm ấm/lạnh. Không nằm quá lâu. Nhẹ nhàng vận động.", adviceKo: "휴식, 온냉 찜질. 너무 오래 누워있지 말 것. 가벼운 운동.", top: "46%", left: "70%", emoji: "🦴" },
  { id: "arm", label: "Tay / Cánh tay", labelKo: "팔", symptoms: "Đau, tê, sưng, bong gân", symptomsKo: "통증, 저림, 부종, 염좌", advice: "Nghỉ ngơi, chườm đá (20 phút), băng nhẹ nếu bong gân nhẹ.", adviceKo: "휴식, 얼음 찜질(20분), 가벼운 염좌면 붕대 감기.", top: "40%", left: "20%", emoji: "💪" },
  { id: "leg", label: "Chân", labelKo: "다리", symptoms: "Đau chân, chuột rút, sưng, bong gân", symptomsKo: "다리 통증, 근육 경련, 부종, 염좌", advice: "Kê cao chân, chườm đá. Với chuột rút: kéo căng cơ bắp chân.", adviceKo: "다리 높이기, 얼음 찜질. 근육 경련시: 종아리 근육 스트레칭.", top: "68%", left: "38%", emoji: "🦵" },
  { id: "fever", label: "Sốt / Toàn thân", labelKo: "발열/전신", symptoms: "Sốt, ớn lạnh, mệt mỏi toàn thân, cúm", symptomsKo: "발열, 오한, 전신 피로, 독감", advice: "Nghỉ ngơi đủ giấc, uống nhiều nước, có thể dùng thuốc hạ sốt (Tylenol). Nếu sốt >39°C, đến bệnh viện.", adviceKo: "충분한 휴식, 수분 섭취, 해열제(타이레놀) 복용 가능. 39°C 이상이면 병원 방문.", top: "25%", left: "72%", emoji: "🌡️" },
];

const EMERGENCY = [
  { icon: "🚑", name: "Cấp cứu (119)", nameKo: "응급실 (119)", number: "119", color: "#e53e3e" },
  { icon: "👮", name: "Cảnh sát (112)", nameKo: "경찰 (112)", number: "112", color: "#3b82f6" },
  { icon: "🏥", name: "Y tế nước ngoài (1339)", nameKo: "외국인 의료 (1339)", number: "1339", color: "#22c55e" },
  { icon: "📞", name: "Hỗ trợ nước ngoài (1330)", nameKo: "외국인 지원 (1330)", number: "1330", color: "#f59e0b" },
];

export default function HealthPage() {
  const { isDark, lang } = useApp();
  const [selected, setSelected] = useState<BodyPart | null>(null);
  const [showKo, setShowKo] = useState(false);

  const bg = isDark ? "#1a1a2e" : "#f0f4ff";
  const card = isDark ? "#16213e" : "#fff";
  const text = isDark ? "#e0e0e0" : "#333";
  const sub = isDark ? "#888" : "#666";
  const border = isDark ? "#2d2d4e" : "#e0e0e0";
  const accent = "#4361ee";

  return (
    <div style={{ minHeight: "100vh", background: bg, padding: "20px 16px 80px" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <h2 style={{ color: text, fontSize: 20, fontWeight: 700, marginBottom: 4 }}>❤️ {t(lang, "health_title")}</h2>
        <p style={{ color: sub, fontSize: 13, marginBottom: 20 }}>{t(lang, "health_subtitle")}</p>

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button onClick={() => setShowKo(false)} style={{ flex: 1, padding: "8px", borderRadius: 8, border: `2px solid ${!showKo ? accent : border}`, background: !showKo ? accent : "transparent", color: !showKo ? "#fff" : text, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
            {t(lang, "lang_vi_btn")}
          </button>
          <button onClick={() => setShowKo(true)} style={{ flex: 1, padding: "8px", borderRadius: 8, border: `2px solid ${showKo ? accent : border}`, background: showKo ? accent : "transparent", color: showKo ? "#fff" : text, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
            한국어
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
          {BODY_PARTS.map(part => (
            <button
              key={part.id}
              onClick={() => setSelected(selected?.id === part.id ? null : part)}
              style={{
                background: selected?.id === part.id ? accent : card,
                border: `2px solid ${selected?.id === part.id ? accent : border}`,
                borderRadius: 12, padding: "12px 10px", cursor: "pointer", textAlign: "left",
                boxShadow: "0 2px 6px rgba(0,0,0,0.06)", transition: "all 0.2s",
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 4 }}>{part.emoji}</div>
              <p style={{ color: selected?.id === part.id ? "#fff" : text, fontSize: 13, fontWeight: 700, margin: 0 }}>
                {showKo ? part.labelKo : part.label}
              </p>
            </button>
          ))}
        </div>

        {selected && (
          <div style={{ background: card, borderRadius: 16, padding: 16, marginBottom: 20, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", border: `2px solid ${accent}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 32 }}>{selected.emoji}</span>
              <h3 style={{ color: text, fontSize: 18, fontWeight: 700, margin: 0 }}>
                {showKo ? selected.labelKo : selected.label}
              </h3>
            </div>
            <div style={{ marginBottom: 12 }}>
              <p style={{ color: sub, fontSize: 12, fontWeight: 600, margin: "0 0 4px" }}>
                {showKo ? "주요 증상:" : t(lang, "symptoms_common")}
              </p>
              <p style={{ color: text, fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                {showKo ? selected.symptomsKo : selected.symptoms}
              </p>
            </div>
            <div style={{ background: isDark ? "#1a2f1a" : "#f0fff4", borderRadius: 10, padding: 12 }}>
              <p style={{ color: "#22c55e", fontSize: 12, fontWeight: 600, margin: "0 0 4px" }}>
                {showKo ? "조언:" : t(lang, "advice")}
              </p>
              <p style={{ color: text, fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                {showKo ? selected.adviceKo : selected.advice}
              </p>
            </div>
          </div>
        )}

        <div style={{ background: card, borderRadius: 16, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <p style={{ color: text, fontSize: 15, fontWeight: 700, margin: "0 0 12px" }}>
            {showKo ? "긴급 연락처" : t(lang, "emergency_numbers")}
          </p>
          {EMERGENCY.map(e => (
            <a key={e.number} href={`tel:${e.number}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${border}`, textDecoration: "none" }}>
              <span style={{ fontSize: 24 }}>{e.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ color: text, fontWeight: 600, fontSize: 14, margin: 0 }}>{showKo ? e.nameKo : e.name}</p>
              </div>
              <span style={{ color: e.color, fontWeight: 800, fontSize: 18 }}>{e.number}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
