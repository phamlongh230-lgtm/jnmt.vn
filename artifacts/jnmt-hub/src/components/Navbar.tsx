import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { t, LANGUAGES, LangCode } from "@/lib/i18n";
import LoginModal from "@/components/LoginModal";
import RegisterModal from "@/components/RegisterModal";

const TOOLS = [
  { page: "subtitle", icon: "📝", key: "subtitle" },
  { page: "conversation", icon: "🎙️", key: "conversation" },
  { page: "vocab", icon: "🧠", key: "vocab" },
  { page: "timer", icon: "⏱️", key: "timer" },
  { page: "dday", icon: "📆", key: "dday" },
  { page: "menu", icon: "🍱", key: "menu" },
  { page: "transport", icon: "🚌", key: "transport" },
  { page: "health", icon: "🏥", key: "health" },
  { page: "ai", icon: "🤖", key: "ai" },
];

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
  const { lang, setLang, isDark, toggleDark, currentUser, logout, activePage, setActivePage, chatUnread, resetChatUnread } = useApp();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { page: "home", icon: "🏠", key: "home" },
    { page: "dictionary", icon: "📖", key: "dictionary" },
    { page: "schedule", icon: "📅", key: "schedule" },
    { page: "chat", icon: "💬", key: "chat" },
    { page: "map", icon: "🗺️", key: "map" },
  ];

  const isToolPage = TOOLS.some((tool) => tool.page === activePage);
  const support = SUPPORT_INFO[lang] || SUPPORT_INFO.vi;

  const bg = isDark ? "#1e293b" : "white";
  const border = isDark ? "#334155" : "#e2e8f0";
  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const text2 = isDark ? "#94a3b8" : "#64748b";

  return (
    <>
      <header style={{ background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", color: "white", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", minHeight: 60 }}>

          {/* ☰ Hamburger + Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", color: "white", width: 36, height: 36, borderRadius: 8, cursor: "pointer", fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center" }}
              title={support.title}
            >
              ☰
            </button>
            <a href="#" onClick={(e) => { e.preventDefault(); setActivePage("home"); }}
              style={{ color: "white", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ fontSize: "1.5rem" }}>🎓</span>
              <div>
                <div style={{ fontWeight: 900, fontSize: "1.1rem", lineHeight: 1 }}>JNMT</div>
                <div style={{ fontSize: "0.65rem", opacity: 0.85, lineHeight: 1 }}>학새</div>
              </div>
            </a>
          </div>

          {/* Nav links */}
          <nav style={{ display: "flex", gap: 0, flexWrap: "wrap" }}>
            {navItems.map((item) => (
              <a key={item.page} href={`#${item.page}`}
                onClick={(e) => { e.preventDefault(); setActivePage(item.page); setToolsOpen(false); if (item.page === "chat") resetChatUnread(); }}
                style={{ color: "white", textDecoration: "none", padding: "0.6rem 0.85rem", fontWeight: 500, fontSize: "0.9rem", borderBottom: activePage === item.page ? "3px solid white" : "3px solid transparent", transition: "border-color 0.2s", display: "flex", alignItems: "center", gap: "0.35rem", position: "relative" }}>
                <span>{item.icon}</span>
                <span>{t(lang, item.key)}</span>
                {item.page === "chat" && chatUnread > 0 && (
                  <span style={{ position: "absolute", top: 6, right: 2, background: "#ef4444", color: "white", borderRadius: "50%", width: 18, height: 18, fontSize: "0.65rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
                    {chatUnread > 9 ? "9+" : chatUnread}
                  </span>
                )}
              </a>
            ))}

            {/* Tools dropdown */}
            <div style={{ position: "relative" }}>
              <button onClick={() => setToolsOpen((p) => !p)}
                style={{ color: "white", background: "none", border: "none", padding: "0.6rem 0.85rem", fontWeight: 500, fontSize: "0.9rem", borderBottom: isToolPage ? "3px solid white" : "3px solid transparent", display: "flex", alignItems: "center", gap: "0.35rem", cursor: "pointer", height: "100%" }}>
                <span>🛠️</span>
                <span>{t(lang, "tools")} ▾</span>
              </button>
              {toolsOpen && (
                <>
                  <div onClick={() => setToolsOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 150 }} />
                  <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, background: bg, border: `1px solid ${border}`, borderRadius: 12, minWidth: 210, boxShadow: "0 4px 20px rgba(0,0,0,0.2)", zIndex: 200, overflow: "hidden" }}>
                    {TOOLS.map((tool) => (
                      <button key={tool.page} onClick={() => { setActivePage(tool.page); setToolsOpen(false); }}
                        style={{ display: "flex", alignItems: "center", gap: "0.6rem", width: "100%", padding: "0.65rem 1rem", background: activePage === tool.page ? (isDark ? "#2563eb22" : "#eff6ff") : "none", border: "none", color: textCol, textAlign: "left", cursor: "pointer", fontSize: "0.88rem", fontWeight: activePage === tool.page ? 700 : 400, borderLeft: activePage === tool.page ? "3px solid #2563eb" : "3px solid transparent" }}>
                        <span>{tool.icon}</span>
                        <span>{t(lang, tool.key)}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </nav>

          {/* Right: theme, lang, user */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button onClick={toggleDark}
              style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", color: "white", padding: "0.4rem 0.65rem", borderRadius: 8, cursor: "pointer", fontSize: "1rem" }}
              title={t(lang, "dark_mode")}>
              {isDark ? "☀️" : "🌙"}
            </button>
            <select value={lang} onChange={(e) => setLang(e.target.value as LangCode)}
              style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", color: "white", padding: "0.4rem 0.5rem", borderRadius: 8, cursor: "pointer", fontSize: "0.85rem" }}>
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} style={{ background: "#1d4ed8", color: "white" }}>{l.flag} {l.name}</option>
              ))}
            </select>
            <div style={{ position: "relative" }}>
              <button onClick={() => setUserMenuOpen((p) => !p)}
                style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", color: "white", padding: "0.4rem 0.65rem", borderRadius: 8, cursor: "pointer", fontSize: "1rem" }}>
                {currentUser ? currentUser.username.charAt(0).toUpperCase() : "👤"}
              </button>
              {userMenuOpen && (
                <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: bg, border: `1px solid ${border}`, borderRadius: 12, minWidth: 200, boxShadow: "0 4px 16px rgba(0,0,0,0.15)", zIndex: 200 }}
                  onClick={() => setUserMenuOpen(false)}>
                  {currentUser ? (
                    <>
                      <div style={{ padding: "0.75rem 1rem", borderBottom: `1px solid ${border}` }}>
                        <div style={{ fontWeight: 700, color: textCol }}>{currentUser.username}</div>
                        <div style={{ fontSize: "0.8rem", color: text2, marginTop: 2 }}>{currentUser.email}</div>
                      </div>
                      <button onClick={logout} style={{ display: "block", width: "100%", padding: "0.75rem 1rem", color: "#ef4444", background: "none", border: "none", textAlign: "left", cursor: "pointer", fontWeight: 500, fontSize: "0.9rem" }}>
                        🚪 {t(lang, "logout")}
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setLoginOpen(true)} style={{ display: "block", width: "100%", padding: "0.75rem 1rem", color: "#2563eb", background: "none", border: "none", textAlign: "left", cursor: "pointer", fontWeight: 500, borderBottom: `1px solid ${border}` }}>
                        🔑 {t(lang, "login")}
                      </button>
                      <button onClick={() => setRegisterOpen(true)} style={{ display: "block", width: "100%", padding: "0.75rem 1rem", color: "#2563eb", background: "none", border: "none", textAlign: "left", cursor: "pointer", fontWeight: 500 }}>
                        ✨ {t(lang, "register")}
                      </button>
                    </>
                  )}
                </div>
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
          <div style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: 310, background: bg, zIndex: 400, boxShadow: "4px 0 24px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", overflowY: "auto" }}>

            {/* Header */}
            <div style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", color: "white", padding: "1.5rem 1.25rem 1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>🎓</div>
                  <div style={{ fontWeight: 900, fontSize: "1.1rem" }}>JNMT.kr-학새</div>
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
                    <div style={{ fontSize: "0.75rem", color: text2 }}>Admin · JNMT.kr-학새</div>

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
                {lang === "ko" ? "빠른 이동" : lang === "en" ? "Quick Nav" : lang === "mn" ? "Хурдан навигац" : lang === "kk" ? "Жылдам навигация" : lang === "ru" ? "Быстрая навигация" : "Điều hướng nhanh"}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                {[...navItems, ...TOOLS].map((item) => (
                  <button key={item.page}
                    onClick={() => { setActivePage(item.page); setSidebarOpen(false); }}
                    style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 0.75rem", background: activePage === item.page ? "#eff6ff" : (isDark ? "#0f172a" : "#f8fafc"), border: `1px solid ${activePage === item.page ? "#bfdbfe" : border}`, borderRadius: 8, cursor: "pointer", color: activePage === item.page ? "#2563eb" : textCol, fontSize: "0.82rem", fontWeight: activePage === item.page ? 700 : 400, textAlign: "left" }}>
                    <span>{"icon" in item ? item.icon : "🏠"}</span>
                    <span>{t(lang, "key" in item ? item.key : item.page)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Version */}
            <div style={{ marginTop: "auto", padding: "1rem 1.25rem", borderTop: `1px solid ${border}`, fontSize: "0.72rem", color: text2, textAlign: "center" }}>
              {support.version} 1.3.0 · JNMT.kr-학새 · 2026
            </div>
          </div>
        </>
      )}

      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} onRegister={() => { setLoginOpen(false); setRegisterOpen(true); }} />}
      {registerOpen && <RegisterModal onClose={() => setRegisterOpen(false)} onLogin={() => { setRegisterOpen(false); setLoginOpen(true); }} />}
    </>
  );
}
