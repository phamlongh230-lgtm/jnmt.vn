import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// ── Splash screen ──────────────────────────────────────────
const accent = localStorage.getItem("jnmt_accent") || "#2563eb";
const splash = document.createElement("div");
splash.id = "jnmt-splash";
splash.innerHTML = `
  <div style="
    position:fixed;inset:0;z-index:99999;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    background:${accent};
    transition:opacity 0.45s ease;
    font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif;
  ">
    <div style="
      width:72px;height:72px;border-radius:18px;
      background:rgba(255,255,255,0.22);border:1px solid rgba(255,255,255,0.4);
      display:flex;align-items:center;justify-content:center;
      font-size:2.2rem;margin-bottom:1rem;
      box-shadow:0 8px 32px rgba(0,0,0,0.2);
    ">🎓</div>
    <div style="font-size:1.4rem;font-weight:900;color:white;letter-spacing:-0.5px;">JNMT Student</div>
    <div style="font-size:0.8rem;color:rgba(255,255,255,0.75);margin-top:0.3rem;">전남미래국제고등학교</div>
    <div style="
      margin-top:1.5rem;width:32px;height:32px;
      border:3px solid rgba(255,255,255,0.3);
      border-top-color:white;border-radius:50%;
      animation:spin 0.8s linear infinite;
    "></div>
    <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
  </div>
`;
document.body.appendChild(splash);
setTimeout(() => {
  splash.firstElementChild!.setAttribute("style", (splash.firstElementChild as HTMLElement).style.cssText + "opacity:0;");
  setTimeout(() => splash.remove(), 480);
}, 1300);

// ── Apply saved accent color ───────────────────────────────
if (accent !== "#2563eb") {
  document.documentElement.style.setProperty("--primary", accent);
}

// ── Register service worker ────────────────────────────────
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {/* silent */});
  });
}

createRoot(document.getElementById("root")!).render(<App />);
