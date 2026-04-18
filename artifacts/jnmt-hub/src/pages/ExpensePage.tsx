import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

type Currency = "KRW" | "VND" | "USD";
type Category = "food" | "transport" | "study" | "other";

interface Expense {
  id: string;
  amount: number;
  note: string;
  category: Category;
  currency: Currency;
  date: string;
}

const CATEGORY_ICONS: Record<Category, string> = {
  food: "🍱",
  transport: "🚌",
  study: "📚",
  other: "💼",
};

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  KRW: "₩",
  VND: "₫",
  USD: "$",
};

const STORAGE_KEY = "jnmt_expenses";

function loadExpenses(): Expense[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

export default function ExpensePage() {
  const { isDark, lang } = useApp();
  const [expenses, setExpenses] = useState<Expense[]>(loadExpenses);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState<Category>("food");
  const [currency, setCurrency] = useState<Currency>("KRW");
  const [filterMonth, setFilterMonth] = useState(() => new Date().toISOString().slice(0, 7));

  const border = isDark ? "#334155" : "#e2e8f0";
  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const text2 = isDark ? "#94a3b8" : "#64748b";
  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const inputBg = isDark ? "#0f172a" : "#f8fafc";

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = () => {
    const val = parseFloat(amount.replace(/,/g, ""));
    if (!val || val <= 0) return;
    const e: Expense = {
      id: Date.now().toString(),
      amount: val,
      note: note.trim(),
      category,
      currency,
      date: new Date().toISOString(),
    };
    setExpenses(prev => [e, ...prev]);
    setAmount("");
    setNote("");
  };

  const remove = (id: string) => setExpenses(prev => prev.filter(e => e.id !== id));

  const filtered = expenses.filter(e => e.date.startsWith(filterMonth));

  const totalByCurrency = filtered.reduce((acc, e) => {
    acc[e.currency] = (acc[e.currency] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  const fmt = (n: number, cur: Currency) => {
    if (cur === "KRW" || cur === "VND") return CURRENCY_SYMBOLS[cur] + Math.round(n).toLocaleString();
    return CURRENCY_SYMBOLS[cur] + n.toFixed(2);
  };

  const btnBase: React.CSSProperties = { padding: "0.5rem 0.9rem", borderRadius: 8, border: `1px solid ${border}`, background: inputBg, color: textCol, cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "1.5rem 1rem" }} className="animate-fade-in">
      <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: textCol, marginBottom: "1rem" }}>💰 {t(lang, "expense_tracker")}</h2>

      {/* Month filter */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
        <input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
          style={{ ...btnBase, flex: 1 }} />
      </div>

      {/* Totals */}
      {Object.entries(totalByCurrency).length > 0 && (
        <div className="glass" style={{ borderRadius: 14, padding: "0.85rem 1rem", marginBottom: "1rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.78rem", color: text2, fontWeight: 700 }}>{t(lang, "expense_this_month")}</span>
          {Object.entries(totalByCurrency).map(([cur, total]) => (
            <span key={cur} style={{ fontSize: "1rem", fontWeight: 800, color: "#059669" }}>
              {fmt(total, cur as Currency)}
            </span>
          ))}
        </div>
      )}

      {/* Add form */}
      <div className="glass" style={{ borderRadius: 16, padding: "1rem", marginBottom: "1rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <input
            type="number"
            placeholder={t(lang, "expense_amount")}
            value={amount}
            onChange={e => setAmount(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addExpense()}
            style={{ padding: "0.6rem", border: `1px solid ${border}`, borderRadius: 8, background: inputBg, color: textCol, fontSize: "0.95rem", outline: "none" }}
          />
          <select value={currency} onChange={e => setCurrency(e.target.value as Currency)}
            style={{ ...btnBase, background: inputBg }}>
            {(["KRW", "VND", "USD"] as Currency[]).map(c => (
              <option key={c} value={c}>{CURRENCY_SYMBOLS[c]} {c}</option>
            ))}
          </select>
        </div>
        <input
          placeholder={t(lang, "expense_note")}
          value={note}
          onChange={e => setNote(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addExpense()}
          style={{ width: "100%", padding: "0.6rem", border: `1px solid ${border}`, borderRadius: 8, background: inputBg, color: textCol, fontSize: "0.9rem", outline: "none", marginBottom: "0.5rem", boxSizing: "border-box" }}
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.4rem", marginBottom: "0.75rem" }}>
          {(["food", "transport", "study", "other"] as Category[]).map(c => (
            <button key={c} onClick={() => setCategory(c)}
              style={{ ...btnBase, background: category === c ? "#2563eb" : inputBg, color: category === c ? "white" : text2, fontSize: "0.78rem", padding: "0.45rem 0.25rem" }}>
              {CATEGORY_ICONS[c]} {t(lang, `expense_${c}`)}
            </button>
          ))}
        </div>
        <button onClick={addExpense} disabled={!amount}
          style={{ width: "100%", padding: "0.65rem", background: "#059669", color: "white", border: "none", borderRadius: 10, fontWeight: 700, fontSize: "0.95rem", cursor: amount ? "pointer" : "default", opacity: amount ? 1 : 0.5 }}>
          + {t(lang, "expense_add")}
        </button>
      </div>

      {/* List */}
      <div className="glass" style={{ borderRadius: 16, overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: text2, fontSize: "0.9rem" }}>{t(lang, "expense_empty")}</div>
        ) : (
          filtered.map((e, i) => (
            <div key={e.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", borderBottom: i < filtered.length - 1 ? `1px solid ${border}` : "none" }}>
              <span style={{ fontSize: "1.3rem" }}>{CATEGORY_ICONS[e.category]}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: textCol, fontSize: "0.9rem" }}>{fmt(e.amount, e.currency)}</div>
                {e.note && <div style={{ fontSize: "0.78rem", color: text2 }}>{e.note}</div>}
                <div style={{ fontSize: "0.7rem", color: text2 }}>{new Date(e.date).toLocaleDateString()}</div>
              </div>
              <button onClick={() => remove(e.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "1rem", padding: "0.25rem" }}>🗑</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
