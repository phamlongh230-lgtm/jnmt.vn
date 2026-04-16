import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

interface LinkItem {
  name: string;
  nameKo?: string;
  desc: string;
  url: string;
  icon: string;
  color: string;
  tags: string[];
}

const LINK_GROUPS: { label: string; labelKey?: string; labelKo: string; icon: string; links: LinkItem[] }[] = [
  {
    label: "AI Tools",
    labelKo: "AI 도구",
    icon: "🤖",
    links: [
      { name: "Claude",       desc: "AI của Anthropic — viết, phân tích, lập trình",  url: "https://claude.ai",                icon: "🧠", color: "#d97706", tags: ["claude","ai","chat","anthropic"] },
      { name: "Gemini",       desc: "AI của Google — tìm kiếm thông minh, đa phương tiện", url: "https://gemini.google.com",    icon: "✨", color: "#2563eb", tags: ["gemini","google","ai","chat"] },
      { name: "Perplexity",   desc: "AI tìm kiếm — trả lời có nguồn trích dẫn",        url: "https://perplexity.ai",           icon: "🔍", color: "#7c3aed", tags: ["perplexity","search","ai","research"] },
      { name: "Manus",        desc: "AI agent — tự động hóa tác vụ phức tạp",           url: "https://manus.im",                icon: "🦾", color: "#0891b2", tags: ["manus","agent","ai","automation"] },
      { name: "Gamma",        desc: "Tạo slide, tài liệu đẹp bằng AI",                   url: "https://gamma.app",               icon: "🎨", color: "#db2777", tags: ["gamma","presentation","slide","ai","design"] },
      { name: "ChatGPT",      desc: "AI của OpenAI — hỏi đáp, viết văn, code",           url: "https://chatgpt.com",             icon: "💬", color: "#16a34a", tags: ["chatgpt","openai","ai","chat","gpt"] },
    ],
  },
  {
    label: "Học tiếng Hàn",
    labelKey: "link_group_korean",
    labelKo: "한국어 학습",
    icon: "🇰🇷",
    links: [
      { name: "모두의한국어",  nameKo: "모두의 한국어",  desc: "Giáo trình tiếng Hàn chuẩn của Viện Ngôn ngữ Quốc gia Hàn Quốc", url: "https://korean.go.kr/front/foreigerMain.do", icon: "📚", color: "#2563eb", tags: ["korean","한국어","moduui","learn","language"] },
      { name: "Duolingo",     desc: "Học ngôn ngữ qua trò chơi — tiếng Hàn, Anh...",   url: "https://www.duolingo.com",        icon: "🦉", color: "#65a30d", tags: ["duolingo","learn","language","game","english","korean"] },
      { name: "Naver Dict",   desc: "Từ điển Hàn-Việt, Hàn-Anh của Naver",              url: "https://dict.naver.com",          icon: "📖", color: "#03c75a", tags: ["naver","dictionary","korean","dict","한국어"] },
      { name: "Talk To Me In Korean", desc: "Podcast + bài học tiếng Hàn miễn phí",    url: "https://talktomeinkorean.com",    icon: "🎧", color: "#f97316", tags: ["ttmik","korean","podcast","learn","한국어"] },
    ],
  },
  {
    label: "Sáng tạo & Thiết kế",
    labelKey: "link_group_creative",
    labelKo: "창작 & 디자인",
    icon: "🎨",
    links: [
      { name: "Canva",        desc: "Thiết kế đồ họa, poster, video online",            url: "https://www.canva.com",           icon: "🖼️", color: "#7c3aed", tags: ["canva","design","poster","graphic","creative"] },
      { name: "CapCut Web",   desc: "Chỉnh sửa video online, thêm phụ đề, hiệu ứng",   url: "https://www.capcut.com",          icon: "🎬", color: "#000000", tags: ["capcut","video","edit","creative","film"] },
    ],
  },
  {
    label: "Học tập & Lập trình",
    labelKey: "link_group_study",
    labelKo: "학습 & 코딩",
    icon: "💻",
    links: [
      { name: "NotebookLM",   desc: "AI đọc tài liệu, tóm tắt, tạo podcast từ PDF",    url: "https://notebooklm.google.com",  icon: "📓", color: "#1d4ed8", tags: ["notebooklm","google","ai","notebook","summary","pdf"] },
      { name: "Replit",       desc: "IDE online — code, chạy, chia sẻ ngay trên trình duyệt", url: "https://replit.com",       icon: "💾", color: "#f97316", tags: ["replit","code","ide","programming","online"] },
      { name: "YouTube",      desc: "Video học tập, bài giảng, tài liệu trực quan",     url: "https://youtube.com",            icon: "▶️", color: "#dc2626", tags: ["youtube","video","learn","watch"] },
    ],
  },
];

const ALL_LINKS = LINK_GROUPS.flatMap((g) => g.links);

export default function LinksPage() {
  const { isDark, lang } = useApp();
  const [search, setSearch] = useState("");

  const cardBg  = isDark ? "#1e293b" : "white";
  const border  = isDark ? "#334155" : "#e2e8f0";
  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const text2   = isDark ? "#94a3b8" : "#64748b";
  const inputBg = isDark ? "#0f172a" : "#f8fafc";

  const q = search.toLowerCase().trim();

  // Filter mode: flatten all groups and show matching
  const isSearching = q.length > 0;
  const filteredAll = isSearching
    ? ALL_LINKS.filter((l) => l.name.toLowerCase().includes(q) || l.desc.toLowerCase().includes(q) || l.tags.some((tag) => tag.includes(q)))
    : [];

  const LinkCard = ({ link }: { link: LinkItem }) => (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: "flex", alignItems: "flex-start", gap: "0.85rem", padding: "0.95rem 1rem", background: cardBg, border: `1px solid ${border}`, borderRadius: 12, textDecoration: "none", transition: "box-shadow 0.15s, border-color 0.15s", borderLeft: `4px solid ${link.color}` }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)"; (e.currentTarget as HTMLElement).style.borderLeftColor = link.color; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
    >
      <div style={{ width: 42, height: 42, borderRadius: 10, background: link.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>
        {link.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.2rem" }}>
          <span style={{ fontWeight: 700, color: textCol, fontSize: "0.92rem" }}>{link.name}</span>
          {link.nameKo && <span style={{ fontSize: "0.75rem", color: link.color, fontWeight: 600 }}>{link.nameKo}</span>}
          <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: text2 }}>↗</span>
        </div>
        <div style={{ fontSize: "0.8rem", color: text2, lineHeight: 1.5 }}>{link.desc}</div>
      </div>
    </a>
  );

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "1.5rem 1rem" }} className="animate-fade-in">

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)", borderRadius: 16, padding: "1.75rem 1.5rem", marginBottom: "1.25rem", color: "white" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 900, margin: "0 0 0.3rem" }}>🔗 {t(lang, "links_title")}</h1>
        <p style={{ margin: 0, opacity: 0.9, fontSize: "0.88rem" }}>{t(lang, "links_subtitle")}</p>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "1.25rem" }}>
        <span style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", fontSize: "1rem", pointerEvents: "none" }}>🔍</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t(lang, "search_links_ph")}
          style={{ width: "100%", padding: "0.75rem 1rem 0.75rem 2.5rem", border: `1px solid ${border}`, borderRadius: 12, background: inputBg, color: textCol, fontSize: "0.93rem", outline: "none", boxSizing: "border-box" }}
          autoFocus
        />
        {q && (
          <button onClick={() => setSearch("")} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: text2, fontSize: "1rem", padding: "0.2rem" }}>✕</button>
        )}
      </div>

      {/* Search results */}
      {isSearching && (
        <div>
          {filteredAll.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: text2 }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔍</div>
              <div>{t(lang, "no_results_for")} "<strong>{search}</strong>"</div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: "0.8rem", color: text2, marginBottom: "0.75rem" }}>{filteredAll.length} {t(lang, "results_suffix")}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {filteredAll.map((link) => <LinkCard key={link.url} link={link} />)}
              </div>
            </>
          )}
        </div>
      )}

      {/* Grouped list */}
      {!isSearching && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {LINK_GROUPS.map((group) => (
            <div key={group.label}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "1.2rem" }}>{group.icon}</span>
                <h2 style={{ fontSize: "1rem", fontWeight: 800, color: textCol, margin: 0 }}>{group.labelKey ? t(lang, group.labelKey) : group.label}</h2>
                <span style={{ fontSize: "0.78rem", color: text2, fontWeight: 500 }}>{group.labelKo}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                {group.links.map((link) => <LinkCard key={link.url} link={link} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
