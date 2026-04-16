import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

const PRESETS = [
  { label: "Link trường", value: "https://jnmt.kr" },
  { label: "WiFi trường", value: "WIFI:T:WPA;S:JNMT_SCHOOL;P:password123;;" },
  { label: "Số điện thoại Admin", value: "tel:01063158995" },
];

export default function QRCodePage() {
  const { isDark, lang } = useApp();
  const [text, setText] = useState("https://jnmt.kr");
  const [size, setSize] = useState(250);

  const border = isDark ? "#334155" : "#e2e8f0";
  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const text2 = isDark ? "#94a3b8" : "#64748b";
  const inputBg = isDark ? "#0f172a" : "#f8fafc";

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&bgcolor=${isDark ? "1e293b" : "ffffff"}&color=${isDark ? "f1f5f9" : "0f172a"}&format=png`;

  const download = () => {
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = "qrcode.png";
    a.target = "_blank";
    a.click();
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "1.5rem 1rem" }} className="animate-fade-in">
      <div className="glass-hero" style={{ background: "rgba(15,23,42,0.65)", borderRadius: 22,  padding: "1.5rem", marginBottom: "1.25rem" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 900, margin: 0, marginBottom: "0.25rem" }}>📱 {t(lang, "qrcode")}</h1>
        <p style={{ margin: 0, opacity: 0.75, fontSize: "0.85rem" }}>Tạo QR code từ link, văn bản, số điện thoại...</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem", alignItems: "start" }}>
        {/* Left: inputs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="glass" style={{ borderRadius: 18, padding: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.8rem", color: text2, fontWeight: 600, marginBottom: "0.4rem" }}>{t(lang, "qr_content_label")}</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              style={{ width: "100%", padding: "0.7rem", border: `1px solid ${border}`, borderRadius: 8, background: inputBg, color: textCol, fontSize: "0.9rem", resize: "vertical", outline: "none", boxSizing: "border-box" }}
              placeholder={t(lang, "qr_input_ph")}
            />
            <div style={{ marginTop: "0.75rem" }}>
              <label style={{ display: "block", fontSize: "0.8rem", color: text2, fontWeight: 600, marginBottom: "0.4rem" }}>{t(lang, "qr_size_label")}: {size}×{size}px</label>
              <input type="range" min={100} max={500} step={50} value={size} onChange={(e) => setSize(Number(e.target.value))} style={{ width: "100%" }} />
            </div>
          </div>

          <div className="glass" style={{ borderRadius: 18, padding: "1rem" }}>
            <div style={{ fontSize: "0.8rem", color: text2, fontWeight: 600, marginBottom: "0.6rem" }}>{t(lang, "quick_presets")}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {PRESETS.map((p) => (
                <button key={p.label} onClick={() => setText(p.value)}
                  style={{ padding: "0.55rem 0.85rem", background: isDark ? "#0f172a" : "#f8fafc", border: `1px solid ${border}`, borderRadius: 8, color: textCol, cursor: "pointer", textAlign: "left", fontSize: "0.82rem" }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: QR preview */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
          {text ? (
            <>
              <div style={{ background: "white", padding: 12, borderRadius: 12, border: `1px solid ${border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }}>
                <img src={qrUrl} alt="QR Code" width={Math.min(size, 200)} height={Math.min(size, 200)} style={{ display: "block" }} />
              </div>
              <button onClick={download}
                style={{ padding: "0.6rem 1.25rem", background: "#2563eb", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: "0.85rem" }}>
                ⬇️ {t(lang, "download")}
              </button>
            </>
          ) : (
            <div style={{ width: 200, height: 200, background: isDark ? "#0f172a" : "#f8fafc", borderRadius: 12, border: `1px dashed ${border}`, display: "flex", alignItems: "center", justifyContent: "center", color: text2, fontSize: "0.85rem" }}>
              {t(lang, "qr_placeholder")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
