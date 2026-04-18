import { useState, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

type CalcMode = "basic" | "scientific";

const SCIENTIFIC_FUNCS = [
  { label: "sin", fn: (x: number) => Math.sin((x * Math.PI) / 180) },
  { label: "cos", fn: (x: number) => Math.cos((x * Math.PI) / 180) },
  { label: "tan", fn: (x: number) => Math.tan((x * Math.PI) / 180) },
  { label: "√", fn: (x: number) => Math.sqrt(x) },
  { label: "x²", fn: (x: number) => x * x },
  { label: "log", fn: (x: number) => Math.log10(x) },
  { label: "ln", fn: (x: number) => Math.log(x) },
  { label: "1/x", fn: (x: number) => 1 / x },
];

export default function CalculatorPage() {
  const { isDark, lang } = useApp();
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [operator, setOperator] = useState<string | null>(null);
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [mode, setMode] = useState<CalcMode>("basic");
  const [history, setHistory] = useState<string[]>([]);

  const bg = isDark ? "#0f172a" : "#f1f5f9";
  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const border = isDark ? "#334155" : "#e2e8f0";
  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const text2 = isDark ? "#94a3b8" : "#64748b";
  const btnBg = isDark ? "#334155" : "#f8fafc";
  const btnHover = isDark ? "#475569" : "#e2e8f0";

  const inputDigit = useCallback((digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? digit : display + digit);
    }
  }, [display, waitingForOperand]);

  const inputDecimal = useCallback(() => {
    if (waitingForOperand) { setDisplay("0."); setWaitingForOperand(false); return; }
    if (!display.includes(".")) setDisplay(display + ".");
  }, [display, waitingForOperand]);

  const clear = useCallback(() => {
    setDisplay("0"); setExpression(""); setOperator(null);
    setPrevValue(null); setWaitingForOperand(false);
  }, []);

  const toggleSign = useCallback(() => {
    setDisplay(String(parseFloat(display) * -1));
  }, [display]);

  const percentage = useCallback(() => {
    setDisplay(String(parseFloat(display) / 100));
  }, [display]);

  const handleOperator = useCallback((nextOp: string) => {
    const current = parseFloat(display);
    if (prevValue !== null && operator && !waitingForOperand) {
      const result = calculate(prevValue, current, operator);
      const expr = `${prevValue} ${operator} ${current} =`;
      setHistory(h => [expr + ` ${result}`, ...h].slice(0, 10));
      setDisplay(String(result));
      setPrevValue(result);
      setExpression(`${result} ${nextOp}`);
    } else {
      setPrevValue(current);
      setExpression(`${current} ${nextOp}`);
    }
    setOperator(nextOp);
    setWaitingForOperand(true);
  }, [display, prevValue, operator, waitingForOperand]);

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case "+": return a + b;
      case "−": return a - b;
      case "×": return a * b;
      case "÷": return b !== 0 ? a / b : NaN;
      case "^": return Math.pow(a, b);
      default: return b;
    }
  };

  const equals = useCallback(() => {
    const current = parseFloat(display);
    if (prevValue !== null && operator) {
      const result = calculate(prevValue, current, operator);
      const expr = `${prevValue} ${operator} ${current} = ${isNaN(result) ? "Error" : result}`;
      setHistory(h => [expr, ...h].slice(0, 10));
      setDisplay(isNaN(result) ? "Error" : String(parseFloat(result.toFixed(10))));
      setExpression("");
      setPrevValue(null);
      setOperator(null);
      setWaitingForOperand(true);
    }
  }, [display, prevValue, operator]);

  const applyScientific = useCallback((fn: (x: number) => number, label: string) => {
    const val = parseFloat(display);
    const result = fn(val);
    const expr = `${label}(${val}) = ${isNaN(result) ? "Error" : parseFloat(result.toFixed(10))}`;
    setHistory(h => [expr, ...h].slice(0, 10));
    setDisplay(isNaN(result) ? "Error" : String(parseFloat(result.toFixed(10))));
    setWaitingForOperand(true);
  }, [display]);

  const btnStyle = (color?: string) => ({
    padding: "1rem",
    borderRadius: 12,
    border: `1px solid ${border}`,
    background: color || btnBg,
    color: color ? "white" : textCol,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "1.1rem",
    transition: "opacity 0.1s",
  });

  const opStyle = { ...btnStyle("#2563eb") };
  const eqStyle = { ...btnStyle("#059669") };
  const fnStyle = { ...btnStyle(), fontSize: "0.85rem", padding: "0.65rem" };

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: "1.5rem 1rem" }} className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: textCol, margin: 0 }}>🧮 {t(lang, "calculator")}</h2>
        <div style={{ display: "flex", gap: "0.4rem" }}>
          {(["basic", "scientific"] as CalcMode[]).map((m) => (
            <button key={m} onClick={() => setMode(m)}
              style={{ padding: "0.35rem 0.75rem", borderRadius: 8, border: `1px solid ${border}`, background: mode === m ? "#2563eb" : "transparent", color: mode === m ? "white" : text2, fontWeight: 600, cursor: "pointer", fontSize: "0.78rem" }}>
              {m === "basic" ? t(lang, "calc_basic") : t(lang, "calc_scientific")}
            </button>
          ))}
        </div>
      </div>

      <div className="glass" style={{ borderRadius: 22, overflow: "hidden" }}>
        {/* Display */}
        <div style={{ background: isDark ? "#0f172a" : "#1e293b", padding: "1.25rem 1.25rem 0.75rem", textAlign: "right" }}>
          <div style={{ fontSize: "0.8rem", color: "#94a3b8", minHeight: "1.2rem", marginBottom: "0.25rem" }}>{expression || " "}</div>
          <div style={{ fontSize: display.length > 12 ? "1.5rem" : "2.2rem", fontWeight: 800, color: "white", letterSpacing: "-0.02em", wordBreak: "break-all" }}>{display}</div>
        </div>

        {/* Scientific functions */}
        {mode === "scientific" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.4rem", padding: "0.75rem 0.75rem 0", background: isDark ? "#1e293b" : "#f8fafc" }}>
            {SCIENTIFIC_FUNCS.map(({ label, fn }) => (
              <button key={label} onClick={() => applyScientific(fn, label)} style={fnStyle}>{label}</button>
            ))}
            <button onClick={() => handleOperator("^")} style={{ ...fnStyle, color: "#2563eb", borderColor: "#2563eb" }}>xⁿ</button>
            <button onClick={() => { setDisplay(String(Math.PI)); setWaitingForOperand(true); }} style={fnStyle}>π</button>
            <button onClick={() => { setDisplay(String(Math.E)); setWaitingForOperand(true); }} style={fnStyle}>e</button>
            <button onClick={() => { setDisplay(String(Math.abs(parseFloat(display)))); }} style={fnStyle}>|x|</button>
          </div>
        )}

        {/* Basic buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.4rem", padding: "0.75rem" }}>
          <button onClick={clear} style={btnStyle("#ef4444")}>C</button>
          <button onClick={toggleSign} style={btnStyle()}>+/−</button>
          <button onClick={percentage} style={btnStyle()}>%</button>
          <button onClick={() => handleOperator("÷")} style={opStyle}>÷</button>

          {["7","8","9"].map(d => <button key={d} onClick={() => inputDigit(d)} style={btnStyle()}>{d}</button>)}
          <button onClick={() => handleOperator("×")} style={opStyle}>×</button>

          {["4","5","6"].map(d => <button key={d} onClick={() => inputDigit(d)} style={btnStyle()}>{d}</button>)}
          <button onClick={() => handleOperator("−")} style={opStyle}>−</button>

          {["1","2","3"].map(d => <button key={d} onClick={() => inputDigit(d)} style={btnStyle()}>{d}</button>)}
          <button onClick={() => handleOperator("+")} style={opStyle}>+</button>

          <button onClick={() => inputDigit("0")} style={{ ...btnStyle(), gridColumn: "span 2" }}>0</button>
          <button onClick={inputDecimal} style={btnStyle()}>,</button>
          <button onClick={equals} style={eqStyle}>=</button>
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="glass" style={{ borderRadius: 16, padding: "1rem", marginTop: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: text2 }}>📜 {t(lang, "calc_history")}</span>
            <button onClick={() => setHistory([])} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "0.75rem" }}>{t(lang, "clear")}</button>
          </div>
          {history.map((h, i) => (
            <div key={i} style={{ fontSize: "0.8rem", color: text2, padding: "0.25rem 0", borderBottom: i < history.length - 1 ? `1px solid ${border}` : "none" }}>{h}</div>
          ))}
        </div>
      )}
    </div>
  );
}
