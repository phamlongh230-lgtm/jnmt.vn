import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

const APP_URL = "https://jnmt.kr";
const APP_TEXT = "JNMT - Cổng học tập trường Jeonnam Future International High School";

interface Platform {
  name: string;
  icon: string;
  color: string;
  bg: string;
  getUrl: () => string;
  mobileOnly?: boolean;
}

const PLATFORMS: Platform[] = [
  {
    name: "Telegram",
    icon: "✈️",
    color: "#fff",
    bg: "#2AABEE",
    getUrl: () => `https://t.me/share/url?url=${encodeURIComponent(APP_URL)}&text=${encodeURIComponent(APP_TEXT)}`,
  },
  {
    name: "WhatsApp",
    icon: "💬",
    color: "#fff",
    bg: "#25D366",
    getUrl: () => `https://wa.me/?text=${encodeURIComponent(APP_TEXT + " " + APP_URL)}`,
  },
  {
    name: "Facebook",
    icon: "📘",
    color: "#fff",
    bg: "#1877F2",
    getUrl: () => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(APP_URL)}`,
  },
  {
    name: "Twitter / X",
    icon: "𝕏",
    color: "#fff",
    bg: "#000",
    getUrl: () => `https://twitter.com/intent/tweet?text=${encodeURIComponent(APP_TEXT)}&url=${encodeURIComponent(APP_URL)}`,
  },
  {
    name: "Line",
    icon: "💚",
    color: "#fff",
    bg: "#00B900",
    getUrl: () => `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(APP_URL)}`,
  },
  {
    name: "Discord",
    icon: "🎮",
    color: "#fff",
    bg: "#5865F2",
    getUrl: () => `https://discord.com/`,
  },
  {
    name: "Zalo",
    icon: "🇻🇳",
    color: "#fff",
    bg: "#0068FF",
    getUrl: () => `https://zalo.me/`,
  },
  {
    name: "KakaoTalk",
    icon: "🟡",
    color: "#3C1E1E",
    bg: "#FEE500",
    getUrl: () => `kakaotalk://send?text=${encodeURIComponent(APP_TEXT + " " + APP_URL)}`,
    mobileOnly: true,
  },
  {
    name: "Instagram",
    icon: "📸",
    color: "#fff",
    bg: "linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)",
    getUrl: () => `https://instagram.com/`,
  },
  {
    name: "TikTok",
    icon: "🎵",
    color: "#fff",
    bg: "#010101",
    getUrl: () => `https://tiktok.com/`,
  },
  {
    name: "Naver",
    icon: "🟢",
    color: "#fff",
    bg: "#03C75A",
    getUrl: () => `https://www.naver.com/`,
  },
  {
    name: "YouTube",
    icon: "▶️",
    color: "#fff",
    bg: "#FF0000",
    getUrl: () => `https://youtube.com/`,
  },
];

export default function SocialPage() {
  const { lang, isDark } = useApp();
  const [ytQuery, setYtQuery] = useState("");
  const [ytVideoId, setYtVideoId] = useState("");

  const extractVideoId = (input: string) => {
    try {
      const url = new URL(input);
      if (url.hostname.includes("youtu.be")) return url.pathname.slice(1);
      return url.searchParams.get("v") || "";
    } catch {
      return input.trim(); // assume raw video ID
    }
  };
  const [copied, setCopied] = useState(false);

  const handleShare = (p: Platform) => {
    const url = p.getUrl();
    if (url.startsWith("kakaotalk://") && !/android|iphone|ipad/i.test(navigator.userAgent)) {
      copyLink();
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=500");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(APP_URL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const nativeShare = () => {
    if (navigator.share) {
      navigator.share({ title: "JNMT", text: APP_TEXT, url: APP_URL });
    } else {
      copyLink();
    }
  };

  const card: React.CSSProperties = {
    borderRadius: 20,
    padding: "1.5rem",
    marginBottom: "1.25rem",
  };

  const section = (title: string, children: React.ReactNode) => (
    <div className="glass" style={{ ...card }}>
      <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", color: "var(--primary)" }}>
        {title}
      </h2>
      {children}
    </div>
  );

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "1.25rem 1rem 5rem" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "1.5rem", color: "var(--text)" }}>
        🌐 {t(lang, "social_title")}
      </h1>

      {/* Share JNMT */}
      {section(t(lang, "social_share_jnmt"), (
        <>
          <p style={{ fontSize: "0.85rem", color: "var(--text2)", marginBottom: "1rem" }}>
            {t(lang, "social_share_desc")}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", marginBottom: "1rem" }}>
            {PLATFORMS.map((p) => (
              <button
                key={p.name}
                onClick={() => handleShare(p)}
                style={{
                  background: p.bg,
                  color: p.color,
                  border: "none",
                  borderRadius: 12,
                  padding: "0.5rem 0.9rem",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  transition: "transform 0.12s ease, opacity 0.12s ease",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "")}
              >
                <span>{p.icon}</span>
                <span>{p.name}</span>
                {p.mobileOnly && <span style={{ fontSize: "0.65rem", opacity: 0.7 }}>(mobile)</span>}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "0.6rem" }}>
            <input
              readOnly
              value={APP_URL}
              className="glass-input"
              style={{ flex: 1, padding: "0.55rem 0.85rem", borderRadius: 10, fontSize: "0.85rem" }}
            />
            <button
              className="glass-btn"
              onClick={copyLink}
              style={{ padding: "0.55rem 1rem", borderRadius: 10, fontSize: "0.85rem", fontWeight: 600, color: "var(--primary)" }}
            >
              {copied ? "✅" : "📋"} {copied ? t(lang, "social_copied") : t(lang, "social_copy")}
            </button>
            <button
              className="glass-btn"
              onClick={nativeShare}
              style={{ padding: "0.55rem 1rem", borderRadius: 10, fontSize: "0.85rem", fontWeight: 600, color: "var(--primary)" }}
            >
              🔗 {t(lang, "social_share")}
            </button>
          </div>
        </>
      ))}

      {/* YouTube Learning */}
      {section(t(lang, "social_youtube"), (
        <>
          <p style={{ fontSize: "0.82rem", color: "var(--text2)", marginBottom: "0.75rem" }}>
            {t(lang, "social_yt_desc")}
          </p>
          <div style={{ display: "flex", gap: "0.6rem", marginBottom: "1rem" }}>
            <input
              value={ytQuery}
              onChange={e => setYtQuery(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { const id = extractVideoId(ytQuery); if (id) setYtVideoId(id); } }}
              placeholder={t(lang, "social_yt_placeholder")}
              className="glass-input"
              style={{ flex: 1, padding: "0.55rem 0.85rem", borderRadius: 10, fontSize: "0.85rem" }}
            />
            <button
              className="glass-btn"
              onClick={() => { const id = extractVideoId(ytQuery); if (id) setYtVideoId(id); }}
              style={{ padding: "0.55rem 1rem", borderRadius: 10, fontSize: "0.85rem", fontWeight: 600, color: "var(--primary)" }}
            >
              ▶️ {t(lang, "social_play")}
            </button>
            <button
              className="glass-btn"
              onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(ytQuery || "한국어 배우기")}`, "_blank", "noopener,noreferrer")}
              style={{ padding: "0.55rem 1rem", borderRadius: 10, fontSize: "0.85rem", fontWeight: 600, color: "#FF0000" }}
            >
              🔍 {t(lang, "social_search")}
            </button>
          </div>
          {ytVideoId ? (
            <div style={{ borderRadius: 14, overflow: "hidden", aspectRatio: "16/9" }}>
              <iframe
                src={`https://www.youtube.com/embed/${ytVideoId}?autoplay=0`}
                title="YouTube"
                width="100%"
                height="100%"
                style={{ border: "none", display: "block" }}
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          ) : (
            <div style={{ borderRadius: 14, aspectRatio: "16/9", background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: "var(--text2)", fontSize: "0.85rem" }}>
              <span style={{ fontSize: "2.5rem" }}>▶️</span>
              <span>{t(lang, "social_yt_hint")}</span>
            </div>
          )}
        </>
      ))}

      {/* Quick links */}
      {section(t(lang, "social_community"), (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px,1fr))", gap: "0.75rem" }}>
          {[
            { name: "Telegram Channel", icon: "✈️", url: "https://t.me/", color: "#2AABEE" },
            { name: "Discord Server", icon: "🎮", url: "https://discord.gg/", color: "#5865F2" },
            { name: "Zalo Group", icon: "🇻🇳", url: "https://zalo.me/", color: "#0068FF" },
            { name: "KakaoTalk", icon: "🟡", url: "https://open.kakao.com/", color: "#FEE500" },
            { name: "Facebook Group", icon: "📘", url: "https://facebook.com/groups/", color: "#1877F2" },
            { name: "Instagram", icon: "📸", url: "https://instagram.com/", color: "#E1306C" },
          ].map(link => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-btn"
              style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                padding: "1rem 0.5rem", borderRadius: 14, textDecoration: "none",
                color: "var(--text)", gap: "0.4rem", fontSize: "0.78rem",
                fontWeight: 600, textAlign: "center",
              }}
            >
              <span style={{ fontSize: "1.8rem" }}>{link.icon}</span>
              <span>{link.name}</span>
            </a>
          ))}
        </div>
      ))}
    </div>
  );
}
