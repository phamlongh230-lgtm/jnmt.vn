import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";
import { useLoginUser } from "@workspace/api-client-react";

interface Props {
  onClose: () => void;
  onRegister: () => void;
}

export default function LoginModal({ onClose, onRegister }: Props) {
  const { lang, login, isDark, showToast } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginMutation = useLoginUser({
    mutation: {
      onSuccess: (data) => {
        login(data.user, data.token);
        showToast("Đăng nhập thành công!", "success");
        onClose();
      },
      onError: (err: unknown) => {
        const e = err as { data?: { error?: string } };
        setError(e?.data?.error || "Đăng nhập thất bại!");
      },
    },
  });

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    setError("");
    loginMutation.mutate({ data: { email, password } });
  };

  const borderCol = isDark ? "#334155" : "#e2e8f0";
  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const inputBg = isDark ? "#1e293b" : "#f8fafc";

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: "1rem" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="glass" style={{ borderRadius: 22, padding: "2rem", width: "100%", maxWidth: 420 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: textCol }}>🔑 {t(lang, "login")}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "#64748b" }}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 600, color: textCol, fontSize: "0.9rem" }}>{t(lang, "email")}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: "100%", padding: "0.7rem", border: `1px solid ${borderCol}`, borderRadius: 8, background: inputBg, color: textCol, fontSize: "0.95rem" }}
              placeholder="email@example.com"
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 600, color: textCol, fontSize: "0.9rem" }}>{t(lang, "password")}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "0.7rem", border: `1px solid ${borderCol}`, borderRadius: 8, background: inputBg, color: textCol, fontSize: "0.95rem" }}
              placeholder="••••••"
            />
          </div>

          {error && (
            <div style={{ background: isDark ? "#450a0a" : "#fef2f2", color: "#ef4444", padding: "0.7rem", borderRadius: 8, marginBottom: "1rem", fontSize: "0.9rem", border: `1px solid ${isDark ? "#7f1d1d" : "#fecaca"}` }}>
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            style={{ width: "100%", padding: "0.8rem", background: "#2563eb", color: "white", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: "1rem", opacity: loginMutation.isPending ? 0.7 : 1 }}
          >
            {loginMutation.isPending ? "..." : t(lang, "login")}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1rem", color: "#64748b", fontSize: "0.9rem" }}>
          {t(lang, "no_account")}{" "}
          <button onClick={onRegister} style={{ color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
            {t(lang, "register")}
          </button>
        </p>
      </div>
    </div>
  );
}
