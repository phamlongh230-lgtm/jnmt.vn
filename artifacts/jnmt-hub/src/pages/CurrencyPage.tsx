import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";

const CURRENCIES = [
  { code: "KRW", flag: "🇰🇷", name: "Won Hàn Quốc", symbol: "₩" },
  { code: "VND", flag: "🇻🇳", name: "Đồng Việt Nam", symbol: "₫" },
  { code: "MNT", flag: "🇲🇳", name: "Tögrög Mông Cổ", symbol: "₮" },
  { code: "KZT", flag: "🇰🇿", name: "Tenge Kazakhstan", symbol: "₸" },
  { code: "RUB", flag: "🇷🇺", name: "Rúp Nga", symbol: "₽" },
  { code: "USD", flag: "🇺🇸", name: "Đô la Mỹ", symbol: "$" },
  { code: "EUR", flag: "🇪🇺", name: "Euro", symbol: "€" },
  { code: "CNY", flag: "🇨🇳", name: "Nhân dân tệ", symbol: "¥" },
  { code: "JPY", flag: "🇯🇵", name: "Yên Nhật", symbol: "¥" },
];

function getCurrencyInfo(code: string) {
  return CURRENCIES.find((c) => c.code === code) || { code, flag: "💱", name: code, symbol: "" };
}

function fmt(n: number, code: string) {
  if (n === 0) return "0";
  if (n >= 1000) return n.toLocaleString("vi-VN", { maximumFractionDigits: 0 });
  if (n >= 1) return n.toLocaleString("vi-VN", { maximumFractionDigits: 4 });
  return n.toPrecision(4);
}

export default function CurrencyPage() {
  const { isDark } = useApp();
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [fromCode, setFromCode] = useState("KRW");
  const [toCode, setToCode] = useState("VND");
  const [fromVal, setFromVal] = useState("10000");
  const [toVal, setToVal] = useState("");
  const [updated, setUpdated] = useState("");
  // rates are always relative to fromCode

  const cardBg = isDark ? "#1e293b" : "white";
  const border = isDark ? "#334155" : "#e2e8f0";
  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const text2 = isDark ? "#94a3b8" : "#64748b";
  const inputBg = isDark ? "#0f172a" : "#f8fafc";

  useEffect(() => {
    setLoading(true);
    const targets = CURRENCIES.map((c) => c.code).filter((c) => c !== fromCode).join(",");
    fetch(`https://api.frankfurter.app/latest?from=${fromCode}&to=${targets}`)
      .then((r) => r.json())
      .then((d) => {
        const r: Record<string, number> = { ...(d.rates || {}), [fromCode]: 1 };
        setRates(r);
        setUpdated(d.date || "");
        setLoading(false);
        // recalculate toVal
        const num = parseFloat(fromVal.replace(/,/g, "")) || 0;
        const rate = r[toCode];
        if (rate) setToVal(fmt(num * rate, toCode));
      })
      .catch(() => setLoading(false));
  }, [fromCode]);

  // When fromVal changes, update toVal
  const handleFromChange = (val: string) => {
    setFromVal(val);
    const num = parseFloat(val.replace(/,/g, "")) || 0;
    const rate = rates[toCode];
    if (rate !== undefined) setToVal(num === 0 ? "" : fmt(num * rate, toCode));
  };

  // When toVal changes, update fromVal (reverse calc)
  const handleToChange = (val: string) => {
    setToVal(val);
    const num = parseFloat(val.replace(/,/g, "")) || 0;
    const rate = rates[toCode];
    if (rate && rate !== 0) setFromVal(num === 0 ? "" : fmt(num / rate, fromCode));
  };

  // When toCode changes, recalc
  const handleToCode = (code: string) => {
    setToCode(code);
    const num = parseFloat(fromVal.replace(/,/g, "")) || 0;
    const rate = rates[code];
    if (rate !== undefined) setToVal(num === 0 ? "" : fmt(num * rate, code));
  };

  // Swap
  const swap = () => {
    setFromCode(toCode);
    setToCode(fromCode);
    setFromVal(toVal || "0");
    setToVal(fromVal || "0");
  };

  const fromInfo = getCurrencyInfo(fromCode);
  const toInfo = getCurrencyInfo(toCode);
  const toRate = rates[toCode];
  const fromRate = toRate ? 1 / toRate : null;

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "1.5rem 1rem" }} className="animate-fade-in">
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", borderRadius: 16, padding: "1.5rem", color: "white", marginBottom: "1.25rem" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 900, margin: 0, marginBottom: "0.25rem" }}>💱 Đổi tiền tệ</h1>
        <p style={{ margin: 0, opacity: 0.85, fontSize: "0.85rem" }}>Tỷ giá thực tế · Nhập bên nào cũng tính được</p>
      </div>

      {/* Converter card */}
      <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 16, padding: "1.5rem", marginBottom: "1rem" }}>
        {/* From row */}
        <div style={{ marginBottom: "0.75rem" }}>
          <label style={{ fontSize: "0.75rem", color: text2, fontWeight: 600, marginBottom: "0.35rem", display: "block" }}>Từ</label>
          <div style={{ display: "flex", gap: "0.6rem" }}>
            <select
              value={fromCode}
              onChange={(e) => { setFromCode(e.target.value); }}
              style={{ flex: "0 0 auto", padding: "0.7rem 0.6rem", border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: textCol, fontSize: "0.9rem", outline: "none", cursor: "pointer", minWidth: 140 }}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
              ))}
            </select>
            <div style={{ flex: 1, position: "relative" }}>
              <input
                type="number"
                value={fromVal}
                onChange={(e) => handleFromChange(e.target.value)}
                placeholder="0"
                style={{ width: "100%", padding: "0.7rem 0.85rem", border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: textCol, fontSize: "1.1rem", fontWeight: 700, outline: "none", boxSizing: "border-box" }}
              />
              <span style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", fontSize: "0.8rem", color: text2, pointerEvents: "none" }}>{fromInfo.symbol}</span>
            </div>
          </div>
        </div>

        {/* Rate hint + Swap button */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0.25rem 0 0.75rem" }}>
          <div style={{ fontSize: "0.75rem", color: text2 }}>
            {!loading && toRate ? (
              <>1 {fromCode} = {fmt(toRate, toCode)} {toCode} · 1 {toCode} = {fromRate ? fmt(fromRate, fromCode) : "—"} {fromCode}</>
            ) : loading ? "Đang tải..." : "—"}
          </div>
          <button
            onClick={swap}
            title="Đổi chiều"
            style={{ background: "#10b981", color: "white", border: "none", borderRadius: 8, width: 36, height: 36, cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
          >⇄</button>
        </div>

        {/* To row */}
        <div>
          <label style={{ fontSize: "0.75rem", color: text2, fontWeight: 600, marginBottom: "0.35rem", display: "block" }}>Sang</label>
          <div style={{ display: "flex", gap: "0.6rem" }}>
            <select
              value={toCode}
              onChange={(e) => handleToCode(e.target.value)}
              style={{ flex: "0 0 auto", padding: "0.7rem 0.6rem", border: `1px solid #10b981`, borderRadius: 10, background: inputBg, color: textCol, fontSize: "0.9rem", outline: "none", cursor: "pointer", minWidth: 140 }}
            >
              {CURRENCIES.filter((c) => c.code !== fromCode).map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
              ))}
            </select>
            <div style={{ flex: 1, position: "relative" }}>
              <input
                type="number"
                value={toVal}
                onChange={(e) => handleToChange(e.target.value)}
                placeholder="0"
                style={{ width: "100%", padding: "0.7rem 0.85rem", border: `1px solid #10b981`, borderRadius: 10, background: isDark ? "#0c2a1e" : "#f0fdf4", color: "#10b981", fontSize: "1.1rem", fontWeight: 800, outline: "none", boxSizing: "border-box" }}
              />
              <span style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", fontSize: "0.8rem", color: "#10b981", pointerEvents: "none" }}>{toInfo.symbol}</span>
            </div>
          </div>
        </div>
      </div>

      {/* All rates table */}
      <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "0.75rem 1rem", borderBottom: `1px solid ${border}`, fontSize: "0.82rem", color: text2, fontWeight: 600 }}>
          Tất cả tỷ giá so với {fromInfo.flag} {fromCode}
        </div>
        {loading ? (
          <div style={{ textAlign: "center", color: text2, padding: "1.5rem" }}>Đang tải...</div>
        ) : (
          CURRENCIES.filter((c) => c.code !== fromCode).map((c, i, arr) => {
            const rate = rates[c.code];
            if (!rate) return null;
            const num = parseFloat(fromVal.replace(/,/g, "")) || 0;
            const converted = fmt(num * rate, c.code);
            const rateStr = fmt(rate, c.code);
            return (
              <div key={c.code}
                onClick={() => handleToCode(c.code)}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1rem", borderBottom: i < arr.length - 1 ? `1px solid ${border}` : undefined, cursor: "pointer", background: toCode === c.code ? (isDark ? "#0c2a1e" : "#f0fdf4") : "transparent", transition: "background 0.15s" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <span style={{ fontSize: "1.3rem" }}>{c.flag}</span>
                  <div>
                    <div style={{ fontWeight: toCode === c.code ? 700 : 500, color: toCode === c.code ? "#10b981" : textCol, fontSize: "0.9rem" }}>{c.code} <span style={{ fontWeight: 400, fontSize: "0.75rem", color: text2 }}>– {c.name}</span></div>
                    <div style={{ fontSize: "0.7rem", color: text2 }}>1 {fromCode} = {rateStr} {c.code}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 800, color: toCode === c.code ? "#10b981" : textCol, fontSize: "1rem" }}>{c.symbol}{converted}</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {updated && (
        <div style={{ textAlign: "center", fontSize: "0.7rem", color: text2, marginTop: "0.75rem" }}>
          Tỷ giá ngày {updated} · Nguồn: frankfurter.app (ECB)
        </div>
      )}
    </div>
  );
}
