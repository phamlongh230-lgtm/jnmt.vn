import { useRef, useEffect } from "react";
import { useApp } from "@/context/AppContext";

const EMOJIS: Record<string, string[]> = {
  "😀 Mặt": ["😀","😂","🥹","😊","😍","🤩","😎","😭","😢","😡","😱","🤔","😴","🥳","😏","🤗","🙄","😅","🤣","😇","🥰","😋","😜","🤪","😬","🤐","🥺","😤","🤯","🥸"],
  "👍 Tay": ["👍","👎","👏","🙌","🤝","✌️","🤞","👌","🤙","💪","🙏","🤜","👋","✋","🖐️","☝️","👈","👉","👆","👇","🤘","🤟","🖖"],
  "❤️ Tim": ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","💔","💕","💞","💓","💗","💖","💝","💟","❣️","💌","🫀","🫶"],
  "🔥 Vật": ["🔥","⭐","✨","🌈","🎉","🎊","🎁","🎈","🏆","💯","🚀","🌙","☀️","⚡","🌊","🎵","🎶","💡","🍀","🌸","🦋","🐱","🐶","🍕","🍜","🎮","💻","📱","🤖","👻"],
};

interface Props {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export default function EmojiPicker({ onSelect, onClose }: Props) {
  const { isDark } = useApp();
  const ref = useRef<HTMLDivElement>(null);

  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const text2 = isDark ? "#94a3b8" : "#64748b";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div ref={ref} className="glass" style={{
      position: "absolute", bottom: "calc(100% + 8px)", left: 0,
      borderRadius: 12, zIndex: 100,
      width: 320, maxHeight: 300, overflowY: "auto",
    }}>
      {Object.entries(EMOJIS).map(([category, emojis]) => (
        <div key={category} style={{ padding: "0.5rem 0.6rem 0.25rem" }}>
          <div style={{ fontSize: "0.7rem", color: text2, fontWeight: 700, marginBottom: "0.3rem", textTransform: "uppercase", letterSpacing: 0.5 }}>
            {category}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {emojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => onSelect(emoji)}
                style={{ background: "none", border: "none", fontSize: "1.3rem", cursor: "pointer", padding: "3px 4px", borderRadius: 6, lineHeight: 1, color: textCol }}
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
