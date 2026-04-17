import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { t, LANGUAGES, LangCode } from "@/lib/i18n";
import LoginModal from "@/components/LoginModal";
import RegisterModal from "@/components/RegisterModal";
import { getToken } from "@/lib/auth";
import { haptic } from "@/lib/haptic";

const TOOL_GROUPS = [
  {
    labelKey: "tool_group_study",
    tools: [
      { page: "notes",        icon: "📓", key: "notes_page" },
      { page: "subtitle",     icon: "📝", key: "subtitle" },
      { page: "conversation", icon: "🎙️", key: "conversation" },
      { page: "vocab",        icon: "🧠", key: "vocab" },
      { page: "timer",        icon: "⏱️", key: "timer" },
      { page: "dday",         icon: "📆", key: "dday" },
      { page: "gpa",          icon: "📊", key: "gpa" },
      { page: "koreanword",   icon: "🇰🇷", key: "koreanword" },
      { page: "ai",           icon: "🤖", key: "ai" },
      { page: "tinkercad",    icon: "🔧", key: "tinkercad" },
    ],
  },
  {
    labelKey: "tool_group_utility",
    tools: [
      { page: "menu",         icon: "🍱", key: "menu" },
      { page: "transport",    icon: "🚌", key: "transport" },
      { page: "health",       icon: "🏥", key: "health" },
      { page: "weather",      icon: "🌤️", key: "weather_tool" },
      { page: "currency",     icon: "💱", key: "currency" },
      { page: "qrcode",       icon: "📱", key: "qrcode" },
      { page: "timezone",     icon: "🌍", key: "timezone_tool" },
    ],
  },
  {
    labelKey: "tool_group_community",
    tools: [
      { page: "announcements",icon: "📢", key: "announcements" },
      { page: "links",        icon: "🔗", key: "links_page" },
      { page: "admin",        icon: "⚙️", key: "admin_page" },
    ],
  },
];

// flat list for sidebar + active detection
const TOOLS = TOOL_GROUPS.flatMap((g) => g.tools);

const AVATAR_COLORS = ["#2563eb","#7c3aed","#059669","#d97706","#dc2626","#0891b2","#db2777","#65a30d"];
const ROLE_BADGE: Record<string, { label: string; color: string }> = {
  admin: { label: "Admin", color: "#7c3aed" },
  moderator: { label: "Mod", color: "#2563eb" },
};

// Thông tin hỗ trợ bằng 6 ngôn ngữ
const SUPPORT_INFO: Record<string, {
  title: string;
  subtitle: string;
  contact: string;
  phone: string;
  note: string;
  version: string;
}> = {
  vi: {
    title: "Thông tin hỗ trợ",
    subtitle: "Liên hệ Admin khi gặp sự cố",
    contact: "Liên hệ",
    phone: "Điện thoại",
    note: "💡 Vui lòng liên hệ Admin nếu gặp sự cố hoặc có góp ý về hệ thống.",
    version: "Phiên bản",
  },
  ko: {
    title: "지원 정보",
    subtitle: "문제 발생 시 관리자에게 연락하세요",
    contact: "연락처",
    phone: "전화번호",
    note: "💡 시스템 문제나 제안 사항이 있으면 관리자에게 연락해 주세요.",
    version: "버전",
  },
  en: {
    title: "Support Info",
    subtitle: "Contact Admin if you encounter issues",
    contact: "Contact",
    phone: "Phone",
    note: "💡 Please contact Admin if you encounter any issues or have suggestions.",
    version: "Version",
  },
  mn: {
    title: "Дэмжлэгийн мэдээлэл",
    subtitle: "Асуудал гарвал Админтай холбогдоорой",
    contact: "Холбоо барих",
    phone: "Утас",
    note: "💡 Системд асуудал гарвал эсвэл санал хүсэлт байвал Админтай холбогдоно уу.",
    version: "Хувилбар",
  },
  kk: {
    title: "Қолдау ақпараты",
    subtitle: "Мәселе туындаса Әкімшіге хабарласыңыз",
    contact: "Байланыс",
    phone: "Телефон",
    note: "💡 Жүйеде мәселе туындаса немесе ұсыныстарыңыз болса Әкімшіге хабарласыңыз.",
    version: "Нұсқа",
  },
  ru: {
    title: "Информация о поддержке",
    subtitle: "Свяжитесь с администратором при проблемах",
    contact: "Контакты",
    phone: "Телефон",
    note: "💡 Пожалуйста, свяжитесь с администратором при возникновении проблем или предложений.",
    version: "Версия",
  },
};

export default function Navbar() {
  const { lang, setLang, isDark, toggleDark, currentUser, logout, activePage, setActivePage, chatUnread, resetChatUnread, showToast, updateUser } = useApp();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [toolSearch, setToolSearch] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  const navItems = [
    { page: "home", icon: "🏠", key: "home" },
    { page: "dictionary", icon: "📖", key: "dictionary" },
    { page: "schedule", icon: "📅", key: "schedule" },
    { page: "chat", icon: "💬", key: "chat" },
    { page: "map", icon: "🗺️", key: "map" },
  ];

  const isToolPage = TOOLS.some((tool) => tool.page === activePage);
  const support = SUPPORT_INFO[lang] || SUPPORT_INFO.vi;

  const border = isDark ? "#334155" : "#e2e8f0";
  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const text2 = isDark ? "#94a3b8" : "#64748b";

  return (
    <>
      <header className="glass-nav" style={{ color: "white", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", minHeight: 60 }}>

          {/* ☰ Hamburger + Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.30)", color: "white", width: 36, height: 36, borderRadius: 12, cursor: "pointer", fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(10px)", transition: "background 0.15s" }}
              title={support.title}
            >
              ☰
            </button>
            <a href="#" onClick={(e) => { e.preventDefault(); setActivePage("home"); }}
              style={{ color: "white", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <img src="/favicon.svg" alt="JNMT Student" width={34} height={34} style={{ borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.35)", flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 900, fontSize: "1.05rem", lineHeight: 1, letterSpacing: -0.3 }}>JNMT Student</div>
                <div style={{ fontSize: "0.62rem", opacity: 0.80, lineHeight: 1.3 }}>학생</div>
              </div>
            </a>
          </div>

          {/* Nav links — iOS pill style on active */}
          <nav style={{ display: "flex", gap: "0.15rem", flexWrap: "wrap", alignItems: "center" }}>
            {navItems.map((item) => {
              const isActive = activePage === item.page;
              return (
                <a key={item.page} href={`#${item.page}`}
                  onClick={(e) => { e.preventDefault(); haptic(); setActivePage(item.page); setToolsOpen(false); if (item.page === "chat") resetChatUnread(); }}
                  style={{
                    color: "white", textDecoration: "none",
                    padding: "0.45rem 0.85rem",
                    fontWeight: isActive ? 700 : 500, fontSize: "0.88rem",
                    borderRadius: 100,
                    background: isActive ? "rgba(255,255,255,0.22)" : "transparent",
                    border: isActive ? "1px solid rgba(255,255,255,0.35)" : "1px solid transparent",
                    boxShadow: isActive ? "inset 0 1px 0 rgba(255,255,255,0.45)" : "none",
                    transition: "background 0.15s, border-color 0.15s",
                    display: "flex", alignItems: "center", gap: "0.35rem", position: "relative",
                  }}>
                  <span>{item.icon}</span>
                  <span>{t(lang, item.key)}</span>
                  {item.page === "chat" && chatUnread > 0 && (
                    <span style={{ position: "absolute", top: -2, right: -2, background: "#ef4444", color: "white", borderRadius: "50%", width: 17, height: 17, fontSize: "0.6rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
                      {chatUnread > 9 ? "9+" : chatUnread}
                    </span>
                  )}
                </a>
              );
            })}

            {/* Tools dropdown */}
            <div style={{ position: "relative" }}>
              <button onClick={() => setToolsOpen((p) => !p)}
                style={{
                  color: "white", cursor: "pointer",
                  padding: "0.45rem 0.85rem",
                  fontWeight: isToolPage ? 700 : 500, fontSize: "0.88rem",
                  borderRadius: 100,
                  background: isToolPage ? "rgba(255,255,255,0.22)" : "transparent",
                  border: isToolPage ? "1px solid rgba(255,255,255,0.35)" : "1px solid transparent",
                  boxShadow: isToolPage ? "inset 0 1px 0 rgba(255,255,255,0.45)" : "none",
                  display: "flex", alignItems: "center", gap: "0.35rem",
                }}>
                <span>🛠️</span>
                <span>{t(lang, "tools")} ▾</span>
              </button>
              {toolsOpen && (
                <>
                  <div onClick={() => { setToolsOpen(false); setToolSearch(""); }} style={{ position: "fixed", inset: 0, zIndex: 150 }} />
                  <div className="glass-panel" style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, borderRadius: 20, minWidth: 244, maxHeight: "80vh", overflowY: "auto", zIndex: 200 }}>
                    {/* Search box */}
                    <div style={{ padding: "0.6rem 0.75rem", borderBottom: `1px solid ${border}`, position: "sticky", top: 0, background: "transparent", backdropFilter: "none", zIndex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: isDark ? "#0f172a" : "#f1f5f9", borderRadius: 8, padding: "0.4rem 0.65rem" }}>
                        <span style={{ fontSize: "0.85rem" }}>🔍</span>
                        <input
                          value={toolSearch}
                          onChange={(e) => setToolSearch(e.target.value)}
                          placeholder={t(lang, "search_tool_ph")}
                          style={{ border: "none", background: "none", outline: "none", color: textCol, fontSize: "0.85rem", width: "100%" }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        {toolSearch && <button onClick={(e) => { e.stopPropagation(); setToolSearch(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: text2, fontSize: "0.8rem", padding: 0, lineHeight: 1 }}>✕</button>}
                      </div>
                    </div>
                    {(() => {
                      const q = toolSearch.toLowerCase();
                      if (q) {
                        const flat = TOOL_GROUPS.flatMap((g) => g.tools).filter((tool) => t(lang, tool.key).toLowerCase().includes(q) || tool.page.includes(q));
                        return flat.length === 0
                          ? <div style={{ padding: "1rem", fontSize: "0.83rem", color: text2, textAlign: "center" }}>{t(lang, "no_results")}</div>
                          : flat.map((tool) => (
                            <button key={tool.page} onClick={() => { haptic(); setActivePage(tool.page); setToolsOpen(false); setToolSearch(""); }}
                              style={{ display: "flex", alignItems: "center", gap: "0.6rem", width: "100%", padding: "0.55rem 1rem", background: activePage === tool.page ? (isDark ? "#2563eb22" : "#eff6ff") : "none", border: "none", color: textCol, textAlign: "left", cursor: "pointer", fontSize: "0.88rem", fontWeight: activePage === tool.page ? 700 : 400, borderLeft: activePage === tool.page ? "3px solid #2563eb" : "3px solid transparent" }}>
                              <span>{tool.icon}</span>
                              <span>{t(lang, tool.key)}</span>
                            </button>
                          ));
                      }
                      return TOOL_GROUPS.map((group, gi) => (
                        <div key={group.labelKey}>
                          <div style={{ padding: "0.45rem 1rem 0.25rem", fontSize: "0.65rem", fontWeight: 800, color: text2, textTransform: "uppercase", letterSpacing: 1, borderTop: gi > 0 ? `1px solid ${border}` : undefined }}>
                            {t(lang, group.labelKey)}
                          </div>
                          {group.tools.map((tool) => (
                            <button key={tool.page} onClick={() => { haptic(); setActivePage(tool.page); setToolsOpen(false); setToolSearch(""); }}
                              style={{ display: "flex", alignItems: "center", gap: "0.6rem", width: "100%", padding: "0.55rem 1rem", background: activePage === tool.page ? (isDark ? "#2563eb22" : "#eff6ff") : "none", border: "none", color: textCol, textAlign: "left", cursor: "pointer", fontSize: "0.88rem", fontWeight: activePage === tool.page ? 700 : 400, borderLeft: activePage === tool.page ? "3px solid #2563eb" : "3px solid transparent" }}>
                              <span>{tool.icon}</span>
                              <span>{t(lang, tool.key)}</span>
                            </button>
                          ))}
                        </div>
                      ));
                    })()}
                  </div>
                </>
              )}
            </div>
          </nav>

          {/* Right: theme, lang, user */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <button onClick={toggleDark}
              style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.30)", color: "white", padding: "0.4rem 0.6rem", borderRadius: 100, cursor: "pointer", fontSize: "1rem", backdropFilter: "blur(10px)" }}
              title={t(lang, "dark_mode")}>
              {isDark ? "☀️" : "🌙"}
            </button>
            <select value={lang} onChange={(e) => setLang(e.target.value as LangCode)}
              style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.30)", color: "white", padding: "0.4rem 0.5rem", borderRadius: 100, cursor: "pointer", fontSize: "0.85rem" }}>
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} style={{ background: "#1d4ed8", color: "white" }}>{l.flag} {l.name}</option>
              ))}
            </select>
            <div style={{ position: "relative" }}>
              <button onClick={() => setUserMenuOpen((p) => !p)}
                style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.30)", color: "white", padding: currentUser?.avatarUrl ? "0" : "0.4rem 0.6rem", borderRadius: 100, cursor: "pointer", fontSize: "1rem", backdropFilter: "blur(10px)", overflow: "hidden", width: currentUser?.avatarUrl ? 36 : undefined, height: currentUser?.avatarUrl ? 36 : undefined }}>
                {currentUser?.avatarUrl
                  ? <img src={currentUser.avatarUrl} alt="avatar" style={{ width: 36, height: 36, objectFit: "cover", display: "block" }} />
                  : currentUser ? currentUser.username.charAt(0).toUpperCase() : "👤"}
              </button>
              {userMenuOpen && (
                <>
                  <div onClick={() => setUserMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 150 }} />
                  <div className="glass-panel" style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, borderRadius: 20, minWidth: 224, zIndex: 200 }}>
                    {currentUser ? (
                      <>
                        <div style={{ padding: "0.75rem 1rem", borderBottom: `1px solid ${border}` }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: currentUser.avatarColor || "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "0.9rem", flexShrink: 0, overflow: "hidden" }}>
                              {currentUser.avatarUrl
                                ? <img src={currentUser.avatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                : currentUser.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                                <span style={{ fontWeight: 700, color: textCol, fontSize: "0.9rem" }}>{currentUser.username}</span>
                                {ROLE_BADGE[currentUser.role || ""] && (
                                  <span style={{ fontSize: "0.6rem", background: ROLE_BADGE[currentUser.role!].color + "20", color: ROLE_BADGE[currentUser.role!].color, padding: "0.1rem 0.35rem", borderRadius: 4, fontWeight: 700 }}>
                                    {ROLE_BADGE[currentUser.role!].label}
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: "0.75rem", color: text2, marginTop: 1 }}>{currentUser.email}</div>
                            </div>
                          </div>
                        </div>
                        {/* Avatar color picker */}
                        <div style={{ padding: "0.6rem 1rem", borderBottom: `1px solid ${border}` }}>
                          <div style={{ fontSize: "0.75rem", color: text2, marginBottom: "0.4rem", fontWeight: 600 }}>🎨 {t(lang, "avatar_color")}</div>
                          <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                            {AVATAR_COLORS.map((c) => (
                              <button key={c} onClick={async () => {
                                const r = await fetch("/api/auth/profile", { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }, body: JSON.stringify({ avatarColor: c }) });
                                if (r.ok) { const u = await r.json(); updateUser(u); showToast(t(lang, "avatar_updated"), "success"); }
                              }} style={{ width: 22, height: 22, borderRadius: "50%", background: c, border: currentUser.avatarColor === c ? "2px solid white" : "2px solid transparent", outline: currentUser.avatarColor === c ? `2px solid ${c}` : "none", cursor: "pointer", padding: 0 }} />
                            ))}
                          </div>
                        </div>
                        <button onClick={() => { setUserMenuOpen(false); setActivePage("profile"); }} style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%", padding: "0.65rem 1rem", color: textCol, background: "none", border: "none", textAlign: "left", cursor: "pointer", fontWeight: 500, fontSize: "0.88rem", borderBottom: `1px solid ${border}` }}>
                          👤 {t(lang, "profile")}
                        </button>
                        <button onClick={() => { setUserMenuOpen(false); setActivePage("about"); }} style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%", padding: "0.65rem 1rem", color: textCol, background: "none", border: "none", textAlign: "left", cursor: "pointer", fontWeight: 500, fontSize: "0.88rem", borderBottom: `1px solid ${border}` }}>
                          ℹ️ {t(lang, "about")}
                        </button>
                        <button onClick={() => { setUserMenuOpen(false); setPwOpen(true); }} style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%", padding: "0.65rem 1rem", color: textCol, background: "none", border: "none", textAlign: "left", cursor: "pointer", fontWeight: 500, fontSize: "0.88rem", borderBottom: `1px solid ${border}` }}>
                          🔒 {t(lang, "change_password")}
                        </button>
                        <button onClick={logout} style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%", padding: "0.65rem 1rem", color: "#ef4444", background: "none", border: "none", textAlign: "left", cursor: "pointer", fontWeight: 500, fontSize: "0.88rem" }}>
                          🚪 {t(lang, "logout")}
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setLoginOpen(true); setUserMenuOpen(false); }} style={{ display: "block", width: "100%", padding: "0.75rem 1rem", color: "#2563eb", background: "none", border: "none", textAlign: "left", cursor: "pointer", fontWeight: 500, borderBottom: `1px solid ${border}` }}>
                          🔑 {t(lang, "login")}
                        </button>
                        <button onClick={() => { setRegisterOpen(true); setUserMenuOpen(false); }} style={{ display: "block", width: "100%", padding: "0.75rem 1rem", color: "#2563eb", background: "none", border: "none", textAlign: "left", cursor: "pointer", fontWeight: 500 }}>
                          ✨ {t(lang, "register")}
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ─── SIDEBAR ───────────────────────────────────────── */}
      {sidebarOpen && (
        <>
          {/* Overlay */}
          <div onClick={() => setSidebarOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 300, backdropFilter: "blur(2px)" }} />

          {/* Panel */}
          <div className="glass-panel" style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: 310, borderRadius: "0 28px 28px 0", zIndex: 400, boxShadow: "8px 0 60px rgba(0,0,0,0.22)", display: "flex", flexDirection: "column", overflowY: "auto" }}>

            {/* Header */}
            <div style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.85), rgba(124,58,237,0.80))", backdropFilter: "blur(10px)", color: "white", padding: "1.5rem 1.25rem 1.25rem", borderRadius: "0 20px 0 0", borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <img src="/favicon.svg" alt="logo" width={44} height={44} style={{ borderRadius: 11, marginBottom: "0.3rem", boxShadow: "0 2px 8px rgba(0,0,0,0.25)" }} />
                  <div style={{ fontWeight: 900, fontSize: "1.1rem" }}>JNMT Student</div>
                  <div style={{ fontSize: "0.75rem", opacity: 0.85, marginTop: "0.1rem" }}>전남미래국제고등학교</div>
                </div>
                <button onClick={() => setSidebarOpen(false)}
                  style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  ✕
                </button>
              </div>
            </div>

            {/* Support title */}
            <div style={{ padding: "1.25rem 1.25rem 0.5rem" }}>
              <div style={{ fontWeight: 800, fontSize: "1rem", color: "#2563eb", marginBottom: "0.25rem" }}>
                📞 {support.title}
              </div>
              <div style={{ fontSize: "0.8rem", color: text2 }}>{support.subtitle}</div>
            </div>

            {/* Admin info */}
            <div style={{ padding: "0 1.25rem" }}>
              {/* Admin card */}
              <div style={{ background: isDark ? "#0f172a" : "#f8fafc", border: `1px solid ${border}`, borderRadius: 12, padding: "1rem", marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #2563eb, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: "1.1rem", flexShrink: 0 }}>
                    VT
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: textCol, fontSize: "0.95rem" }}>Vũ Văn Tâm</div>
                    <div style={{ fontSize: "0.75rem", color: text2 }}>Admin · JNMT Student</div>

                  </div>
                </div>

                {/* Phone */}
                <a href="tel:01063158995" style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.6rem 0.75rem", background: isDark ? "#1e293b" : "white", border: `1px solid ${border}`, borderRadius: 8, textDecoration: "none", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "1.1rem" }}>📱</span>
                  <div>
                    <div style={{ fontSize: "0.7rem", color: text2, fontWeight: 600 }}>{support.phone}</div>
                    <div style={{ fontSize: "0.9rem", color: "#2563eb", fontWeight: 700 }}>010-6315-8995</div>
                  </div>
                </a>

                {/* Gmail */}
                <a href="mailto:phamlongh230@gmail.com" style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.6rem 0.75rem", background: isDark ? "#1e293b" : "white", border: `1px solid ${border}`, borderRadius: 8, textDecoration: "none", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "1.1rem" }}>📧</span>
                  <div>
                    <div style={{ fontSize: "0.7rem", color: text2, fontWeight: 600 }}>Gmail</div>
                    <div style={{ fontSize: "0.82rem", color: "#2563eb", fontWeight: 600 }}>phamlongh230@gmail.com</div>
                  </div>
                </a>

                {/* iCloud */}
                <a href="mailto:phamlongh230@icloud.com" style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.6rem 0.75rem", background: isDark ? "#1e293b" : "white", border: `1px solid ${border}`, borderRadius: 8, textDecoration: "none", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "1.1rem" }}>🍎</span>
                  <div>
                    <div style={{ fontSize: "0.7rem", color: text2, fontWeight: 600 }}>iCloud</div>
                    <div style={{ fontSize: "0.82rem", color: "#2563eb", fontWeight: 600 }}>phamlongh230@icloud.com</div>
                  </div>
                </a>

                {/* DuyBui */}
                <a href="mailto:duybui4680@gmail.com" style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.6rem 0.75rem", background: isDark ? "#1e293b" : "white", border: `1px solid ${border}`, borderRadius: 8, textDecoration: "none" }}>
                  <span style={{ fontSize: "1.1rem" }}>📧</span>
                  <div>
                    <div style={{ fontSize: "0.7rem", color: text2, fontWeight: 600 }}>Gmail (phụ)</div>
                    <div style={{ fontSize: "0.82rem", color: "#2563eb", fontWeight: 600 }}>duybui4680@gmail.com</div>
                  </div>
                </a>
              </div>

              {/* Note */}
              <div style={{ background: isDark ? "#1e3a1e" : "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "0.85rem", marginBottom: "1rem", fontSize: "0.82rem", color: isDark ? "#86efac" : "#166534", lineHeight: 1.5 }}>
                {support.note}
              </div>
            </div>

            {/* Nav shortcuts */}
            <div style={{ padding: "0 1.25rem", marginBottom: "0.5rem" }}>
              <div style={{ fontSize: "0.72rem", color: text2, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: "0.5rem" }}>
                {t(lang, "quick_nav")}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                {[...navItems, ...TOOLS].map((item) => (
                  <button key={item.page}
                    onClick={() => { haptic(); setActivePage(item.page); setSidebarOpen(false); }}
                    style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 0.75rem", background: activePage === item.page ? "#eff6ff" : (isDark ? "#0f172a" : "#f8fafc"), border: `1px solid ${activePage === item.page ? "#bfdbfe" : border}`, borderRadius: 8, cursor: "pointer", color: activePage === item.page ? "#2563eb" : textCol, fontSize: "0.82rem", fontWeight: activePage === item.page ? 700 : 400, textAlign: "left" }}>
                    <span>{item.icon}</span>
                    <span>{t(lang, item.key)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Version */}
            <div style={{ marginTop: "auto", padding: "1rem 1.25rem", borderTop: `1px solid ${border}`, fontSize: "0.72rem", color: text2, textAlign: "center" }}>
              {support.version} 1.5.0 · JNMT Student · 2026
            </div>
          </div>
        </>
      )}

      {/* ─── MOBILE BOTTOM NAV ─────────────────────────── */}
      <style>{`
        @media (min-width: 640px) { .mobile-bottom-nav { display: none !important; } }
        @media (max-width: 639px) { .mobile-bottom-nav { display: flex !important; } }
      `}</style>
      <nav className="mobile-bottom-nav glass-bottom" style={{ display: "none", position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200, justifyContent: "space-around", alignItems: "center", padding: "0.3rem 0 calc(0.3rem + env(safe-area-inset-bottom))" }}>
        {[
          { page: "home",       icon: "🏠", labelKey: "home",       badge: 0 },
          { page: "chat",       icon: "💬", labelKey: "chat",       badge: chatUnread },
          { page: "dictionary", icon: "📖", labelKey: "dictionary", badge: 0 },
          { page: "tools",      icon: "🛠️", labelKey: "tools",      badge: 0 },
          { page: "user",       icon: "👤", labelKey: "nav_me",     badge: 0 },
        ].map((item) => {
          const isActive = item.page === "tools" ? isToolPage : activePage === item.page;
          return (
            <button key={item.page} onClick={() => {
              if (item.page === "tools") { setToolsOpen((v) => !v); }
              else if (item.page === "user") { setUserMenuOpen((v) => !v); }
              else { haptic(); setActivePage(item.page); if (item.page === "chat") resetChatUnread(); }
            }} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.15rem", padding: "0.3rem 0.6rem", position: "relative", minWidth: 52, borderRadius: 12 }}>
              {/* iOS pill highlight behind active item */}
              {isActive && <span style={{ position: "absolute", inset: "0.15rem 0.2rem", borderRadius: 10, background: isDark ? "rgba(37,99,235,0.22)" : "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.20)" }} />}
              <span style={{ fontSize: "1.25rem", position: "relative" }}>{item.icon}</span>
              <span style={{ fontSize: "0.58rem", color: isActive ? "#2563eb" : text2, fontWeight: isActive ? 700 : 400, position: "relative" }}>{t(lang, item.labelKey)}</span>
              {item.badge > 0 && <span style={{ position: "absolute", top: 2, right: 6, background: "#ef4444", color: "white", borderRadius: "50%", width: 16, height: 16, fontSize: "0.55rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{item.badge > 9 ? "9+" : item.badge}</span>}
            </button>
          );
        })}
      </nav>

      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} onRegister={() => { setLoginOpen(false); setRegisterOpen(true); }} />}
      {registerOpen && <RegisterModal onClose={() => setRegisterOpen(false)} onLogin={() => { setRegisterOpen(false); setLoginOpen(true); }} />}

      {/* Change password modal */}
      {pwOpen && (
        <>
          <div onClick={() => { setPwOpen(false); setOldPw(""); setNewPw(""); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500, backdropFilter: "blur(2px)" }} />
          <div className="glass-panel" style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", borderRadius: 20, padding: "1.5rem", width: "min(400px, 90vw)", zIndex: 600 }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: textCol, marginBottom: "1rem" }}>🔒 {t(lang, "change_password")}</h2>
            <input type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} placeholder={t(lang, "current_password_ph")} style={{ width: "100%", padding: "0.65rem", border: `1px solid ${border}`, borderRadius: 8, background: isDark ? "#0f172a" : "#f8fafc", color: textCol, fontSize: "0.9rem", marginBottom: "0.75rem", outline: "none", boxSizing: "border-box" }} />
            <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder={t(lang, "new_password_ph")} style={{ width: "100%", padding: "0.65rem", border: `1px solid ${border}`, borderRadius: 8, background: isDark ? "#0f172a" : "#f8fafc", color: textCol, fontSize: "0.9rem", marginBottom: "1rem", outline: "none", boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button onClick={() => { setPwOpen(false); setOldPw(""); setNewPw(""); }} style={{ padding: "0.6rem 1rem", background: "none", border: `1px solid ${border}`, borderRadius: 8, color: text2, cursor: "pointer", fontSize: "0.9rem" }}>{t(lang, "cancel")}</button>
              <button disabled={pwSaving || !oldPw || newPw.length < 6} onClick={async () => {
                setPwSaving(true);
                try {
                  const r = await fetch("/api/auth/password", { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }, body: JSON.stringify({ currentPassword: oldPw, newPassword: newPw }) });
                  if (r.ok) { showToast(t(lang, "password_changed"), "success"); setPwOpen(false); setOldPw(""); setNewPw(""); }
                  else { const e = await r.json(); showToast(e.error || t(lang, "error_generic"), "error"); }
                } finally { setPwSaving(false); }
              }} style={{ padding: "0.6rem 1.25rem", background: "#2563eb", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: "0.9rem", opacity: (pwSaving || !oldPw || newPw.length < 6) ? 0.6 : 1 }}>
                {pwSaving ? "..." : t(lang, "save")}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
