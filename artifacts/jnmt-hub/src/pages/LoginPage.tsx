import { useState, FormEvent } from "react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";
import { setToken, setStoredUser, User } from "@/lib/auth";

export default function LoginPage() {
  const { login, isDark, lang } = useApp();
  const [tab, setTab] = useState<"login" | "register">("login");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPw, setLoginPw] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPw, setRegPw] = useState("");
  const [regPw2, setRegPw2] = useState("");
  const [regErr, setRegErr] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regDone, setRegDone] = useState(false);

  const bg = isDark ? "#0f172a" : "#f1f5f9";
  const cardBg = isDark ? "#1e293b" : "white";
  const border = isDark ? "#334155" : "#e2e8f0";
  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const text2 = isDark ? "#94a3b8" : "#64748b";
  const inputBg = isDark ? "#0f172a" : "#f8fafc";

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem 1rem",
    border: `1px solid ${border}`,
    borderRadius: 10,
    background: inputBg,
    color: textCol,
    fontSize: "0.95rem",
    outline: "none",
    boxSizing: "border-box",
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginErr("");
    setLoginLoading(true);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPw }),
      });
      const d = await r.json();
      if (!r.ok) { setLoginErr(d.error || t(lang, "error_login_failed")); return; }
      setToken(d.token);
      setStoredUser(d.user as User);
      login(d.user as User, d.token);
    } catch {
      setLoginErr(t(lang, "error_server"));
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setRegErr("");
    if (regPw !== regPw2) { setRegErr(t(lang, "error_password_mismatch")); return; }
    if (regPw.length < 6) { setRegErr(t(lang, "error_password_short")); return; }
    setRegLoading(true);
    try {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: regUsername, email: regEmail, password: regPw }),
      });
      const d = await r.json();
      if (!r.ok) { setRegErr(d.error || t(lang, "error_login_failed")); return; }
      setRegDone(true);
    } catch {
      setRegErr(t(lang, "error_server"));
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1.5rem 1rem" }}>
      {/* Logo / Branding */}
      <div style={{ marginBottom: "1.75rem", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "0.25rem" }}>🏫</div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: textCol, margin: 0 }}>JNMT.kr</h1>
        <p style={{ margin: "0.35rem 0 0", fontSize: "0.85rem", color: text2 }}>전남미래국제고등학교 · 학생 포털</p>
      </div>

      {/* Card */}
      <div style={{ width: "100%", maxWidth: 420, background: cardBg, border: `1px solid ${border}`, borderRadius: 16, overflow: "hidden", boxShadow: isDark ? "0 4px 32px rgba(0,0,0,0.4)" : "0 4px 24px rgba(0,0,0,0.08)" }}>
        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: `1px solid ${border}` }}>
          {(["login", "register"] as const).map((tabKey) => (
            <button key={tabKey} onClick={() => { setTab(tabKey); setLoginErr(""); setRegErr(""); setRegDone(false); }}
              style={{ flex: 1, padding: "0.85rem", background: "none", border: "none", cursor: "pointer", fontWeight: tab === tabKey ? 700 : 400, fontSize: "0.9rem", color: tab === tabKey ? "#2563eb" : text2, borderBottom: tab === tabKey ? "2px solid #2563eb" : "2px solid transparent", transition: "all 0.15s" }}>
              {tabKey === "login" ? t(lang, "tab_login") : t(lang, "tab_register")}
            </button>
          ))}
        </div>

        <div style={{ padding: "1.5rem" }}>
          {tab === "login" && (
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: text2, display: "block", marginBottom: "0.35rem" }}>{t(lang, "email")}</label>
                <input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="email@example.com" style={inputStyle} autoComplete="email" />
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: text2, display: "block", marginBottom: "0.35rem" }}>{t(lang, "password")}</label>
                <input type="password" required value={loginPw} onChange={(e) => setLoginPw(e.target.value)} placeholder="••••••••" style={inputStyle} autoComplete="current-password" />
              </div>
              {loginErr && <div style={{ background: isDark ? "#450a0a" : "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "0.6rem 0.85rem", fontSize: "0.85rem", color: "#ef4444" }}>{loginErr}</div>}
              <button type="submit" disabled={loginLoading}
                style={{ width: "100%", padding: "0.8rem", background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", color: "white", border: "none", borderRadius: 10, fontWeight: 700, fontSize: "0.95rem", cursor: loginLoading ? "not-allowed" : "pointer", opacity: loginLoading ? 0.7 : 1 }}>
                {loginLoading ? t(lang, "logging_in") : t(lang, "login_btn")}
              </button>
            </form>
          )}

          {tab === "register" && !regDone && (
            <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: text2, display: "block", marginBottom: "0.35rem" }}>{t(lang, "display_name")}</label>
                <input type="text" required value={regUsername} onChange={(e) => setRegUsername(e.target.value)} placeholder={t(lang, "name_ph")} style={inputStyle} autoComplete="username" minLength={2} maxLength={40} />
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: text2, display: "block", marginBottom: "0.35rem" }}>{t(lang, "email")}</label>
                <input type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="email@example.com" style={inputStyle} autoComplete="email" />
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: text2, display: "block", marginBottom: "0.35rem" }}>{t(lang, "password")}</label>
                <input type="password" required value={regPw} onChange={(e) => setRegPw(e.target.value)} placeholder="••••••••" style={inputStyle} autoComplete="new-password" minLength={6} />
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: text2, display: "block", marginBottom: "0.35rem" }}>{t(lang, "confirm_password")}</label>
                <input type="password" required value={regPw2} onChange={(e) => setRegPw2(e.target.value)} placeholder="••••••••" style={inputStyle} autoComplete="new-password" />
              </div>
              {regErr && <div style={{ background: isDark ? "#450a0a" : "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "0.6rem 0.85rem", fontSize: "0.85rem", color: "#ef4444" }}>{regErr}</div>}
              <button type="submit" disabled={regLoading}
                style={{ width: "100%", padding: "0.8rem", background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)", color: "white", border: "none", borderRadius: 10, fontWeight: 700, fontSize: "0.95rem", cursor: regLoading ? "not-allowed" : "pointer", opacity: regLoading ? 0.7 : 1 }}>
                {regLoading ? t(lang, "registering") : t(lang, "create_account_btn")}
              </button>
            </form>
          )}

          {tab === "register" && regDone && (
            <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>✅</div>
              <div style={{ fontWeight: 700, color: "#16a34a", marginBottom: "0.5rem" }}>{t(lang, "register_success_title")}</div>
              <div style={{ fontSize: "0.85rem", color: text2, marginBottom: "1.25rem" }}>{t(lang, "register_success_desc")}</div>
              <button onClick={() => { setTab("login"); setLoginEmail(regEmail); setRegDone(false); }}
                style={{ padding: "0.7rem 1.5rem", background: "#2563eb", color: "white", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: "0.9rem" }}>
                {t(lang, "login_now_btn")}
              </button>
            </div>
          )}
        </div>
      </div>

      <p style={{ marginTop: "1.5rem", fontSize: "0.78rem", color: text2, textAlign: "center" }}>
        전남미래국제고등학교 · 학생 전용 포털
      </p>
    </div>
  );
}
