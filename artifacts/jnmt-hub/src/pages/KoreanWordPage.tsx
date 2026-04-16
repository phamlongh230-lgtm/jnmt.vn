import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

const WORDS = [
  { ko: "안녕하세요", ro: "An-nyeong-ha-se-yo", vi: "Xin chào", en: "Hello", mn: "Сайн уу", category: "인사" },
  { ko: "감사합니다", ro: "Gam-sa-ham-ni-da", vi: "Cảm ơn", en: "Thank you", mn: "Баярлалаа", category: "인사" },
  { ko: "죄송합니다", ro: "Joe-song-ham-ni-da", vi: "Xin lỗi", en: "I'm sorry", mn: "Уучлаарай", category: "인사" },
  { ko: "도와주세요", ro: "Do-wa-ju-se-yo", vi: "Giúp tôi với", en: "Please help me", mn: "Надад тусал", category: "긴급" },
  { ko: "이해했어요", ro: "I-hae-hae-sseo-yo", vi: "Tôi hiểu rồi", en: "I understood", mn: "Би ойлголоо", category: "수업" },
  { ko: "모르겠어요", ro: "Mo-reu-ge-sseo-yo", vi: "Tôi không biết", en: "I don't know", mn: "Мэдэхгүй байна", category: "수업" },
  { ko: "다시 말씀해 주세요", ro: "Da-si mal-sseum-hae ju-se-yo", vi: "Nói lại được không?", en: "Please say it again", mn: "Дахин хэлнэ үү", category: "수업" },
  { ko: "화장실이 어디예요?", ro: "Hwa-jang-sil-i eo-di-ye-yo?", vi: "Nhà vệ sinh ở đâu?", en: "Where is the restroom?", mn: "Жорлон хаана байна?", category: "학교" },
  { ko: "밥 먹었어요?", ro: "Bab meo-geo-sseo-yo?", vi: "Bạn ăn cơm chưa?", en: "Have you eaten?", mn: "Та хоолоо идсэн үү?", category: "일상" },
  { ko: "얼마예요?", ro: "Eol-ma-ye-yo?", vi: "Bao nhiêu tiền?", en: "How much is it?", mn: "Хэд вэ?", category: "쇼핑" },
  { ko: "숙제가 있어요", ro: "Suk-je-ga i-sseo-yo", vi: "Có bài tập về nhà", en: "There is homework", mn: "Гэрийн даалгавар байна", category: "학교" },
  { ko: "시험이 언제예요?", ro: "Si-heom-i eon-je-ye-yo?", vi: "Bao giờ thi?", en: "When is the exam?", mn: "Шалгалт хэзээ вэ?", category: "학교" },
  { ko: "배가 아파요", ro: "Bae-ga a-pa-yo", vi: "Tôi đau bụng", en: "My stomach hurts", mn: "Миний гэдэс өвдөж байна", category: "건강" },
  { ko: "열이 있어요", ro: "Yeol-i i-sseo-yo", vi: "Tôi bị sốt", en: "I have a fever", mn: "Надад халуурах байна", category: "건강" },
  { ko: "친구", ro: "Chin-gu", vi: "Bạn bè", en: "Friend", mn: "Найз", category: "관계" },
  { ko: "선생님", ro: "Seon-saeng-nim", vi: "Thầy/Cô giáo", en: "Teacher", mn: "Багш", category: "관계" },
  { ko: "교실", ro: "Gyo-sil", vi: "Lớp học", en: "Classroom", mn: "Анги өрөө", category: "학교" },
  { ko: "도서관", ro: "Do-seo-gwan", vi: "Thư viện", en: "Library", mn: "Номын сан", category: "학교" },
  { ko: "식당", ro: "Sik-dang", vi: "Căng tin / Nhà ăn", en: "Cafeteria", mn: "Хоолны газар", category: "학교" },
  { ko: "기숙사", ro: "Gi-suk-sa", vi: "Ký túc xá", en: "Dormitory", mn: "Дотуур байр", category: "학교" },
  { ko: "오늘", ro: "O-neul", vi: "Hôm nay", en: "Today", mn: "Өнөөдөр", category: "시간" },
  { ko: "내일", ro: "Nae-il", vi: "Ngày mai", en: "Tomorrow", mn: "Маргааш", category: "시간" },
  { ko: "어제", ro: "Eo-je", vi: "Hôm qua", en: "Yesterday", mn: "Өчигдөр", category: "시간" },
  { ko: "주말", ro: "Ju-mal", vi: "Cuối tuần", en: "Weekend", mn: "Амралтын өдөр", category: "시간" },
  { ko: "좋아해요", ro: "Joa-hae-yo", vi: "Tôi thích", en: "I like it", mn: "Надад таалагдаж байна", category: "감정" },
  { ko: "힘내세요", ro: "Him-nae-se-yo", vi: "Cố lên!", en: "Cheer up!", mn: "Тэсч байгаарай!", category: "격려" },
  { ko: "수고했어요", ro: "Su-go-hae-sseo-yo", vi: "Bạn đã làm tốt lắm!", en: "Good job!", mn: "Сайн хийлээ!", category: "격려" },
  { ko: "잠깐만요", ro: "Jam-kkan-man-yo", vi: "Chờ một chút", en: "Just a moment", mn: "Нэг минут", category: "일상" },
  { ko: "괜찮아요", ro: "Gwaen-chan-a-yo", vi: "Không sao", en: "It's okay", mn: "Зүгээр байна", category: "일상" },
  { ko: "맛있어요", ro: "Ma-si-sseo-yo", vi: "Ngon quá!", en: "It's delicious!", mn: "Амттай байна!", category: "일상" },
];

const CATEGORIES = ["전체", ...Array.from(new Set(WORDS.map((w) => w.category)))];

export default function KoreanWordPage() {
  const { isDark, lang } = useApp();
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  const [search, setSearch] = useState("");

  // Word of the day — based on day of year
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const wordOfDay = WORDS[dayOfYear % WORDS.length];

  const border = isDark ? "#334155" : "#e2e8f0";
  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const text2 = isDark ? "#94a3b8" : "#64748b";
  const inputBg = isDark ? "#0f172a" : "#f8fafc";

  const filtered = WORDS.filter((w) => {
    const matchCat = selectedCategory === "전체" || w.category === selectedCategory;
    const q = search.toLowerCase();
    const matchSearch = !q || w.ko.includes(q) || w.vi.toLowerCase().includes(q) || w.en.toLowerCase().includes(q) || w.ro.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const getMeaning = (w: typeof WORDS[0]) => {
    if (lang === "mn") return w.mn;
    if (lang === "en") return w.en;
    return w.vi;
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "1.5rem 1rem" }} className="animate-fade-in">
      {/* Word of day */}
      <div className="glass-hero" style={{ background: "rgba(245,158,11,0.55)", borderRadius: 22,  padding: "1.5rem", marginBottom: "1.25rem", textAlign: "center" }}>
        <div style={{ fontSize: "0.85rem", opacity: 0.85, marginBottom: "0.5rem" }}>⭐ {t(lang, "word_of_day")}</div>
        <div style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: "0.25rem" }}>{wordOfDay.ko}</div>
        <div style={{ fontSize: "1rem", opacity: 0.9, marginBottom: "0.25rem" }}>[{wordOfDay.ro}]</div>
        <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>{wordOfDay.vi} · {wordOfDay.en}</div>
        <div style={{ fontSize: "0.75rem", opacity: 0.7, marginTop: "0.4rem" }}>#{wordOfDay.category}</div>
      </div>

      {/* Search + filter */}
      <div style={{ display: "flex", gap: "0.6rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t(lang, "search_vocab_ph")}
          style={{ flex: 1, minWidth: 180, padding: "0.6rem 0.85rem", border: `1px solid ${border}`, borderRadius: 8, background: inputBg, color: textCol, fontSize: "0.9rem", outline: "none" }}
        />
      </div>
      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setSelectedCategory(cat)}
            style={{ padding: "0.35rem 0.75rem", borderRadius: 20, border: `1px solid ${selectedCategory === cat ? "#f59e0b" : border}`, background: selectedCategory === cat ? "#f59e0b" : "transparent", color: selectedCategory === cat ? "white" : textCol, fontSize: "0.78rem", cursor: "pointer", fontWeight: 600 }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Word cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.75rem" }}>
        {filtered.map((w, i) => (
          <div key={i} onClick={() => setFlipped((prev) => ({ ...prev, [i]: !prev[i] }))}
            className="glass" style={{ borderRadius: 18, padding: "1rem", cursor: "pointer", transition: "transform 0.1s", userSelect: "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "1.5rem", fontWeight: 900, color: textCol }}>{w.ko}</span>
              <span style={{ fontSize: "0.7rem", background: isDark ? "#334155" : "#f1f5f9", padding: "0.2rem 0.5rem", borderRadius: 10, color: text2 }}>#{w.category}</span>
            </div>
            <div style={{ fontSize: "0.8rem", color: text2, marginBottom: "0.5rem" }}>[{w.ro}]</div>
            {flipped[i] ? (
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "#f59e0b" }}>{getMeaning(w)}</div>
            ) : (
              <div style={{ fontSize: "0.8rem", color: text2 }}>{t(lang, "tap_to_see_meaning")} 👆</div>
            )}
          </div>
        ))}
      </div>
      {filtered.length === 0 && (
        <div style={{ textAlign: "center", color: text2, padding: "2rem" }}>{t(lang, "no_words_found")}</div>
      )}
    </div>
  );
}
