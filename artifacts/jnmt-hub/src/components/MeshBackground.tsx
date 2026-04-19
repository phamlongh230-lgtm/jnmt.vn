import { useApp } from "@/context/AppContext";

const BLOBS_LIGHT = [
  { style: { width: 700, height: 600, top: "-10%", left: "-8%",  background: "rgba(232,121,160,0.30)", animation: "blob-drift-1 28s ease-in-out infinite" } },
  { style: { width: 600, height: 500, bottom: "-12%", right: "-6%", background: "rgba(56,189,248,0.24)", animation: "blob-drift-2 34s ease-in-out infinite" } },
  { style: { width: 500, height: 400, top: "40%", left: "40%",   background: "rgba(232,121,160,0.16)", animation: "blob-drift-3 22s ease-in-out infinite" } },
  { style: { width: 450, height: 380, top: "-5%",  right: "10%",  background: "rgba(56,189,248,0.22)", animation: "blob-drift-4 38s ease-in-out infinite" } },
  { style: { width: 400, height: 350, bottom: "5%", left: "8%",   background: "rgba(244,114,182,0.18)", animation: "blob-drift-1 26s ease-in-out infinite 6s" } },
  { style: { width: 500, height: 420, bottom: "-8%", left: "52%", background: "rgba(14,165,233,0.20)",  animation: "blob-drift-2 30s ease-in-out infinite 3s" } },
];

const BLOBS_DARK = [
  { style: { width: 700, height: 600, top: "-10%", left: "-8%",  background: "rgba(232,121,160,0.45)", animation: "blob-drift-1 28s ease-in-out infinite" } },
  { style: { width: 600, height: 500, bottom: "-12%", right: "-6%", background: "rgba(56,189,248,0.35)", animation: "blob-drift-2 34s ease-in-out infinite" } },
  { style: { width: 500, height: 400, top: "40%", left: "40%",   background: "rgba(232,121,160,0.22)", animation: "blob-drift-3 22s ease-in-out infinite" } },
  { style: { width: 450, height: 380, top: "-5%",  right: "10%",  background: "rgba(56,189,248,0.30)", animation: "blob-drift-4 38s ease-in-out infinite" } },
  { style: { width: 400, height: 350, bottom: "5%", left: "8%",   background: "rgba(244,114,182,0.25)", animation: "blob-drift-1 26s ease-in-out infinite 6s" } },
  { style: { width: 500, height: 420, bottom: "-8%", left: "52%", background: "rgba(14,165,233,0.28)",  animation: "blob-drift-2 30s ease-in-out infinite 3s" } },
];

export default function MeshBackground() {
  const { isDark } = useApp();
  const blobs = isDark ? BLOBS_DARK : BLOBS_LIGHT;

  return (
    <>
      {blobs.map((b, i) => (
        <div key={i} className="mesh-blob" style={b.style as React.CSSProperties} />
      ))}
    </>
  );
}
