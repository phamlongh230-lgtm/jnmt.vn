import { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

const CURRENCIES = [
  { code: "KRW", key: "krw", flag: "🇰🇷", symbol: "₩" },
  { code: "VND", key: "vnd", flag: "🇻🇳", symbol: "₫" },
  { code: "MNT", key: "mnt", flag: "🇲🇳", symbol: "₮" },
  { code: "KZT", key: "kzt", flag: "🇰🇿", symbol: "₸" },
  { code: "RUB", key: "rub", flag: "🇷🇺", symbol: "₽" },
  { code: "USD", key: "usd", flag: "🇺🇸", symbol: "$" },
  { code: "EUR", key: "eur", flag: "🇪🇺", symbol: "€" },
  { code: "JPY", key: "jpy", flag: "🇯🇵", symbol: "¥" },
  { code: "CNY", key: "cny", flag: "🇨🇳", symbol: "¥" },
];

function info(code: string) {
  return CURRENCIES.find((c) => c.code === code) ?? { code, key: code.toLowerCase(), flag: "💱", symbol: "" };
}

function fmt(n: number) {
  if (!isFinite(n) || n === 0) return "0";
  if (n >= 1000)  return n.toLocaleString("vi-VN", { maximumFractionDigits: 0 });
  if (n >= 1)     return n.toLocaleString("vi-VN", { maximumFractionDigits: 4 });
  return n.toPrecision(4);
}

export default function CurrencyPage() {
  const { isDark, lang } = useApp();

  const [rates, setRates]       = useState<Record<string, number>>({});
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);
  const [fromCode, setFromCode] = useState("KRW");
  const [toCode, setToCode]     = useState("VND");
  const [fromVal, setFromVal]   = useState("10000");
  const [toVal, setToVal]       = useState("");
  const [date, setDate]         = useState("");

  const ratesRef = useRef<Record<string, number>>({});

  const border  = isDark ? "#334155" : "#e2e8f0";
  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const text2   = isDark ? "#94a3b8" : "#64748b";
  const inputBg = isDark ? "#0f172a" : "#f8fafc";

  useEffect(() => {
    setLoading(true);
    setError(false);
    const key = info(fromCode).key;
    fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${key}.json`)
      .then((r) => r.json())
      .then((d) => {
        const raw: Record<string, number> = d[key] ?? {};
        const map: Record<string, number> = { [fromCode]: 1 };
        for (const c of CURRENCIES) {
          if (c.code !== fromCode && raw[c.key] !== undefined) {
            map[c.code] = raw[c.key];
          }
        }
        setRates(map);
        ratesRef.current = map;
        setDate(d.date ?? "");
        setLoading(false);
        const num = parseFloat(fromVal) || 0;
        const r = map[toCode];
        setToVal(r != null && num > 0 ? fmt(num * r) : "");
      })
      .catch(() => { setLoading(false); setError(true); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromCode]);

  const onFromVal = (v: string) => {
    setFromVal(v);
    const num = parseFloat(v) || 0;
    const r = ratesRef.current[toCode];
    setToVal(r != null && num > 0 ? fmt(num * r) : "");
  };

  const onToVal = (v: string) => {
    setToVal(v);
    const num = parseFloat(v) || 0;
    const r = ratesRef.current[toCode];
    setFromVal(r != null && r > 0 && num > 0 ? fmt(num / r) : "");
  };

  const onToCode = (code: string) => {
    setToCode(code);
    const num = parseFloat(fromVal) || 0;
    const r = ratesRef.current[code];
    setToVal(r != null && num > 0 ? fmt(num * r) : "");
  };

  const swap = () => {
    const oldFrom  = fromCode;
    const oldTo    = toCode;
    const oldToVal = toVal;
    const oldFromVal = fromVal;
    setFromCode(oldTo);
    setToCode(oldFrom);
    setFromVal(oldToVal || "0");
    setToVal(oldFromVal || "0");
  };

  const cName = (code: string) => t(lang, `currency_${code}`) || code;

  const toRate   = rates[toCode];
  const fromRate = toRate && toRate > 0 ? 1 / toRate : null;
  const fromInfo = info(fromCode);

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", padding: "1.5rem 1rem" }} className="animate-fade-in">
      <div className="glass-hero" style={{ background: "rgba(16,185,129,0.50)", borderRadius: 22,  padding: "1.5rem", marginBottom: "1.25rem" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 900, margin: 0, marginBottom: "0.25rem" }}>💱 {t(lang, "currency")}</h1>
        <p style={{ margin: 0, opacity: 0.85, fontSize: "0.85rem" }}>
          {loading ? t(lang, "loading_rates") : date ? `${t(lang, "exchange_rate_label")} ${date} · ${t(lang, "currency_hint")}` : t(lang, "currency_hint")}
        </p>
      </div>

      {error && (
        <div style={{ background: isDark ? "#450a0a" : "#fef2f2", color: "#ef4444", border: "1px solid #fecaca", borderRadius: 10, padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: "0.85rem" }}>
          ❌ {t(lang, "rate_error")}
        </div>
      )}

      <div className="glass" style={{ borderRadius: 22, padding: "1.25rem", marginBottom: "1rem" }}>
        <div style={{ marginBottom: "0.6rem" }}>
          <div style={{ fontSize: "0.72rem", color: text2, fontWeight: 700, marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: 0.5 }}>{t(lang, "from_currency")}</div>
          <div style={{ display: "flex", gap: "0.6rem" }}>
            <select value={fromCode} onChange={(e) => setFromCode(e.target.value)}
              style={{ flex: "0 0 auto", padding: "0.7rem 0.5rem", border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: textCol, fontSize: "0.88rem", outline: "none", cursor: "pointer", minWidth: 130 }}>
              {CURRENCIES.map((c) => (<option key={c.code} value={c.code}>{c.flag} {c.code} – {cName(c.code)}</option>))}
            </select>
            <input type="number" value={fromVal} onChange={(e) => onFromVal(e.target.value)} placeholder="0"
              style={{ flex: 1, padding: "0.7rem 0.85rem", border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: textCol, fontSize: "1.1rem", fontWeight: 700, outline: "none", boxSizing: "border-box" }} />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "0.75rem 0" }}>
          <div style={{ flex: 1, height: 1, background: border }} />
          <div style={{ fontSize: "0.72rem", color: text2, whiteSpace: "nowrap" }}>
            {loading ? t(lang, "loading") : !error && toRate
              ? `1 ${fromCode} = ${fmt(toRate)} ${toCode}   ·   1 ${toCode} = ${fromRate ? fmt(fromRate) : "—"} ${fromCode}`
              : "—"}
          </div>
          <button onClick={swap} title={t(lang, "swap_btn")}
            style={{ background: "#10b981", color: "white", border: "none", borderRadius: 10, padding: "0.55rem 1rem", cursor: "pointer", fontWeight: 700, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.35rem", flexShrink: 0, boxShadow: "0 2px 8px rgba(16,185,129,0.35)" }}>
            ⇄ {t(lang, "swap_btn")}
          </button>
          <div style={{ flex: 1, height: 1, background: border }} />
        </div>

        <div>
          <div style={{ fontSize: "0.72rem", color: "#10b981", fontWeight: 700, marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: 0.5 }}>{t(lang, "to_currency")}</div>
          <div style={{ display: "flex", gap: "0.6rem" }}>
            <select value={toCode} onChange={(e) => onToCode(e.target.value)}
              style={{ flex: "0 0 auto", padding: "0.7rem 0.5rem", border: `2px solid #10b981`, borderRadius: 10, background: inputBg, color: textCol, fontSize: "0.88rem", outline: "none", cursor: "pointer", minWidth: 130 }}>
              {CURRENCIES.filter((c) => c.code !== fromCode).map((c) => (<option key={c.code} value={c.code}>{c.flag} {c.code} – {cName(c.code)}</option>))}
            </select>
            <input type="number" value={toVal} onChange={(e) => onToVal(e.target.value)} placeholder="0"
              style={{ flex: 1, padding: "0.7rem 0.85rem", border: `2px solid #10b981`, borderRadius: 10, background: isDark ? "#0c2a1e" : "#f0fdf4", color: "#10b981", fontSize: "1.1rem", fontWeight: 800, outline: "none", boxSizing: "border-box" }} />
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
          {[1000, 5000, 10000, 50000, 100000].map((n) => (
            <button key={n} onClick={() => onFromVal(String(n))}
              style={{ padding: "0.3rem 0.7rem", fontSize: "0.78rem", background: fromVal === String(n) ? "#10b981" : "transparent", color: fromVal === String(n) ? "white" : text2, border: `1px solid ${fromVal === String(n) ? "#10b981" : border}`, borderRadius: 20, cursor: "pointer", fontWeight: 600 }}>
              {n.toLocaleString()} {fromInfo.symbol}
            </button>
          ))}
        </div>
      </div>

      <div className="glass" style={{ borderRadius: 18, overflow: "hidden" }}>
        <div style={{ padding: "0.7rem 1rem", borderBottom: `1px solid ${border}`, fontSize: "0.8rem", color: text2, fontWeight: 700 }}>
          {fromInfo.flag} {t(lang, "all_rates_vs")} {fromCode}
        </div>
        {loading ? (
          <div style={{ textAlign: "center", color: text2, padding: "1.5rem" }}>{t(lang, "loading")}</div>
        ) : (
          CURRENCIES.filter((c) => c.code !== fromCode).map((c, i, arr) => {
            const r = rates[c.code];
            if (r == null) return null;
            const num = parseFloat(fromVal) || 0;
            const converted = num > 0 ? fmt(num * r) : "—";
            const isTo = c.code === toCode;
            return (
              <div key={c.code} onClick={() => onToCode(c.code)}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.7rem 1rem", borderBottom: i < arr.length - 1 ? `1px solid ${border}` : undefined, cursor: "pointer", background: isTo ? (isDark ? "#0c2a1e" : "#f0fdf4") : "transparent", transition: "background 0.15s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <span style={{ fontSize: "1.3rem" }}>{c.flag}</span>
                  <div>
                    <div style={{ fontWeight: isTo ? 700 : 500, color: isTo ? "#10b981" : textCol, fontSize: "0.88rem" }}>
                      {c.code}
                      {isTo && <span style={{ fontSize: "0.65rem", background: "#10b98120", color: "#10b981", marginLeft: "0.35rem", padding: "0.1rem 0.35rem", borderRadius: 4, fontWeight: 700 }}>{t(lang, "selected_label")}</span>}
                    </div>
                    <div style={{ fontSize: "0.68rem", color: text2 }}>1 {fromCode} = {fmt(r)} {c.code}</div>
                  </div>
                </div>
                <div style={{ fontWeight: 800, color: isTo ? "#10b981" : textCol, fontSize: "0.95rem" }}>{c.symbol}{converted}</div>
              </div>
            );
          })
        )}
      </div>

      <div style={{ textAlign: "center", fontSize: "0.68rem", color: text2, marginTop: "0.75rem" }}>
        {date ? `${t(lang, "exchange_rate_label")} ${date} · ` : ""}Nguồn: fawazahmed0/currency-api
      </div>
    </div>
  );
}
