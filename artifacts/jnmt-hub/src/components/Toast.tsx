import { useEffect, useState } from "react";

export type ToastType = "success" | "error";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bg = type === "success" ? "#22c55e" : "#ef4444";
  const icon = type === "success" ? "✅" : "❌";

  return (
    <div style={{
      position: "fixed", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)",
      background: bg, color: "white", padding: "0.75rem 1.25rem", borderRadius: 10,
      boxShadow: "0 4px 20px rgba(0,0,0,0.2)", zIndex: 9999, fontSize: "0.95rem",
      fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem",
      opacity: visible ? 1 : 0, transition: "opacity 0.3s", whiteSpace: "nowrap",
    }}>
      {icon} {message}
    </div>
  );
}
