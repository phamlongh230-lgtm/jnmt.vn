import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { t, LANGUAGES, LangCode } from "@/lib/i18n";
import LoginModal from "@/components/LoginModal";
import RegisterModal from "@/components/RegisterModal";

export default function Navbar() {
  const { lang, setLang, isDark, toggleDark, currentUser, logout, activePage, setActivePage } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const navItems = [
    { page: "home", icon: "🏠", key: "home" },
    { page: "dictionary", icon: "📖", key: "dictionary" },
    { page: "schedule", icon: "📅", key: "schedule" },
    { page: "chat", icon: "💬", key: "chat" },
    { page: "map", icon: "🗺️", key: "map" },
  ];

  return (
    <>
      <header style={{ background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", color: "white", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", minHeight: 60 }}>
          {/* Logo + hamburger */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button
              onClick={() => setMenuOpen((p) => !p)}
              style={{ background: "none", border: "none", color: "white", fontSize: "1.3rem", cursor: "pointer", display: "flex", alignItems: "center" }}
            >
              ☰
            </button>
            <a href="#" onClick={() => setActivePage("home")} style={{ color: "white", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ fontSize: "1.5rem" }}>🎓</span>
              <div>
                <div style={{ fontWeight: 900, fontSize: "1.1rem", lineHeight: 1 }}>JNMT</div>
                <div style={{ fontSize: "0.65rem", opacity: 0.85, lineHeight: 1 }}>Student Hub</div>
              </div>
            </a>
          </div>

          {/* Nav links */}
          <nav style={{ display: menuOpen ? "flex" : "flex", gap: 0, flexWrap: "wrap" }}>
            {navItems.map((item) => (
              <a
                key={item.page}
                href={`#${item.page}`}
                onClick={(e) => { e.preventDefault(); setActivePage(item.page); setMenuOpen(false); }}
                style={{
                  color: "white",
                  textDecoration: "none",
                  padding: "0.6rem 0.85rem",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                  borderBottom: activePage === item.page ? "3px solid white" : "3px solid transparent",
                  transition: "border-color 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                }}
              >
                <span>{item.icon}</span>
                <span>{t(lang, item.key)}</span>
              </a>
            ))}
          </nav>

          {/* Right: theme, lang, user */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button
              onClick={toggleDark}
              style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", color: "white", padding: "0.4rem 0.65rem", borderRadius: 8, cursor: "pointer", fontSize: "1rem" }}
              title={t(lang, "dark_mode")}
            >
              {isDark ? "☀️" : "🌙"}
            </button>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as LangCode)}
              style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", color: "white", padding: "0.4rem 0.5rem", borderRadius: 8, cursor: "pointer", fontSize: "0.85rem" }}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} style={{ background: "#1d4ed8", color: "white" }}>
                  {l.flag} {l.name}
                </option>
              ))}
            </select>
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setUserMenuOpen((p) => !p)}
                style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", color: "white", padding: "0.4rem 0.65rem", borderRadius: 8, cursor: "pointer", fontSize: "1rem" }}
              >
                {currentUser ? currentUser.username.charAt(0).toUpperCase() : "👤"}
              </button>
              {userMenuOpen && (
                <div
                  style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: isDark ? "#1e293b" : "white", border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, borderRadius: 12, minWidth: 200, boxShadow: "0 4px 16px rgba(0,0,0,0.15)", zIndex: 200 }}
                  onClick={() => setUserMenuOpen(false)}
                >
                  {currentUser ? (
                    <>
                      <div style={{ padding: "0.75rem 1rem", borderBottom: `1px solid ${isDark ? "#334155" : "#e2e8f0"}` }}>
                        <div style={{ fontWeight: 700, color: isDark ? "#f1f5f9" : "#0f172a" }}>{currentUser.username}</div>
                        <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: 2 }}>{currentUser.email}</div>
                      </div>
                      <button
                        onClick={logout}
                        style={{ display: "block", width: "100%", padding: "0.75rem 1rem", color: "#ef4444", background: "none", border: "none", textAlign: "left", cursor: "pointer", fontWeight: 500, fontSize: "0.9rem" }}
                      >
                        🚪 {t(lang, "logout")}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setLoginOpen(true)}
                        style={{ display: "block", width: "100%", padding: "0.75rem 1rem", color: "#2563eb", background: "none", border: "none", textAlign: "left", cursor: "pointer", fontWeight: 500, borderBottom: `1px solid ${isDark ? "#334155" : "#e2e8f0"}` }}
                      >
                        🔑 {t(lang, "login")}
                      </button>
                      <button
                        onClick={() => setRegisterOpen(true)}
                        style={{ display: "block", width: "100%", padding: "0.75rem 1rem", color: "#2563eb", background: "none", border: "none", textAlign: "left", cursor: "pointer", fontWeight: 500 }}
                      >
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

      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} onRegister={() => { setLoginOpen(false); setRegisterOpen(true); }} />}
      {registerOpen && <RegisterModal onClose={() => setRegisterOpen(false)} onLogin={() => { setRegisterOpen(false); setLoginOpen(true); }} />}
    </>
  );
}
