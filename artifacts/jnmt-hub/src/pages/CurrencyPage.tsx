import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";

const CURRENCIES = [
  { code: "VND", flag: "🇻🇳", name: "Việt Nam Đồng", symbol: "₫" },
  { code: "MNT", flag: "🇲🇳", name: "Tögrög (Mông Cổ)", symbol: "₮" },
  { code: "KZT", flag: "🇰🇿", name: "Tenge (Kazakhstan)", symbol: "₸" },
  { code: "RUB", flag: "🇷🇺", name: "Rúp (Nga)", symbol: "₽" },
  { code: "USD", flag: "🇺🇸", name: "Đô la Mỹ", symbol: "$" },
  { code: "CNY", flag: "🇨🇳", name: "Nhân dân tệ", symbol: "¥" },
];

export default function CurrencyPage() {
  const { isDark } = useApp();
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("10000");
  const [base, setBase] = useState("KRW");
  const [updated, setUpdated] = useState("");

  const cardBg = isDark ? "#1e293b" : "white";
  const border = isDark ? "#334155" : "#e2e8f0";
  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const text2 = isDark ? "#94a3b8" : "#64748b";
  const inputBg = isDark ? "#0f172a" : "#f8fafc";

  useEffect(() => {
    const targets = CURRENCIES.map((c) => c.code).join(",");
    fetch(`https://api.frankfurter.app/latest?from=${base}&to=${targets}`)
      .then((r) => r.json())
      .then((d) => {
        setRates(d.rates || {});
        setUpdated(d.date || "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [base]);

  const num = parseFloat(amount.replace(/,/g, "")) || 0;

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "1.5rem 1rem" }} className="animate-fade-in">
      <div style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", borderRadius: 16, padding: "1.5rem", color: "white", marginBottom: "1.25rem" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 900, margin: 0, marginBottom: "0.25rem" }}>💱 Đổi tiền tệ</h1>
        <p style={{ margin: 0, opacity: 0.85, fontSize: "0.85rem" }}>Tỷ giá thực tế · Cập nhật hàng ngày</p>
      </div>

      <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 12, padding: "1.25rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label style={{ display: "block", fontSize: "0.8rem", color: text2, fontWeight: 600, marginBottom: "0.3rem" }}>Số tiền</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ width: "100%", padding: "0.7rem", border: `1px solid ${border}`, borderRadius: 8, background: inputBg, color: textCol, fontSize: "1rem", fontWeight: 700, outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label style={{ display: "block", fontSize: "0.8rem", color: text2, fontWeight: 600, marginBottom: "0.3rem" }}>Từ tiền tệ</label>
            <select
              value={base}
              onChange={(e) => { setBase(e.target.value); setLoading(true); }}
              style={{ width: "100%", padding: "0.7rem", border: `1px solid ${border}`, borderRadius: 8, background: inputBg, color: textCol, fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }}
            >
              <option value="KRW">🇰🇷 KRW – Won Hàn Quốc</option>
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.code} – {c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", color: text2, padding: "1rem" }}>Đang tải tỷ giá...</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {CURRENCIES.map((c) => {
              if (c.code === base) return null;
              const rate = rates[c.code];
              if (!rate) return null;
              const converted = (num * rate).toLocaleString("vi-VN", { maximumFractionDigits: 0 });
              const rateDisplay = rate >= 1 ? rate.toLocaleString("vi-VN", { maximumFractionDigits: 2 }) : rate.toFixed(6);
              return (
                <div key={c.code} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: isDark ? "#0f172a" : "#f8fafc", borderRadius: 10, padding: "0.85rem 1rem", border: `1px solid ${border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <span style={{ fontSize: "1.4rem" }}>{c.flag}</span>
                    <div>
                      <div style={{ fontWeight: 700, color: textCol, fontSize: "0.9rem" }}>{c.code}</div>
                      <div style={{ fontSize: "0.7rem", color: text2 }}>1 {base} = {rateDisplay} {c.code}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800, color: "#10b981", fontSize: "1.1rem" }}>{c.symbol}{converted}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {updated && (
        <div style={{ textAlign: "center", fontSize: "0.72rem", color: text2 }}>
          Tỷ giá ngày {updated} · Nguồn: frankfurter.app (ECB)
        </div>
      )}
    </div>
  );
}
