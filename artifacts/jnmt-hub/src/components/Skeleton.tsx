import { useApp } from "@/context/AppContext";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: number;
  style?: React.CSSProperties;
}

export default function Skeleton({ width = "100%", height = 16, borderRadius = 6, style }: SkeletonProps) {
  const { isDark } = useApp();
  return (
    <div style={{
      width, height, borderRadius,
      background: isDark ? "#1e293b" : "#e2e8f0",
      animation: "skeleton-pulse 1.5s ease-in-out infinite",
      ...style,
    }} />
  );
}

export function ChatSkeleton() {
  const { isDark } = useApp();
  const cardBg = isDark ? "#1e293b" : "white";
  const items = [1, 2, 3, 4, 5];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", padding: "1rem" }}>
      <style>{`@keyframes skeleton-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      {items.map((i) => {
        const isRight = i % 2 === 0;
        return (
          <div key={i} style={{ display: "flex", flexDirection: isRight ? "row-reverse" : "row", gap: "0.5rem", alignItems: "flex-end" }}>
            {!isRight && <div style={{ width: 32, height: 32, borderRadius: "50%", background: isDark ? "#334155" : "#cbd5e1", flexShrink: 0, animation: "skeleton-pulse 1.5s ease-in-out infinite" }} />}
            <div style={{ maxWidth: "60%", display: "flex", flexDirection: "column", gap: 4 }}>
              {!isRight && <Skeleton width={60} height={10} />}
              <div style={{ background: isRight ? "#3b82f680" : cardBg, padding: "0.55rem 0.85rem", borderRadius: isRight ? "12px 12px 4px 12px" : "12px 12px 12px 4px", border: isRight ? "none" : `1px solid ${isDark ? "#334155" : "#e2e8f0"}` }}>
                <Skeleton width={80 + i * 20} height={14} />
              </div>
              <Skeleton width={40} height={8} style={{ alignSelf: isRight ? "flex-end" : "flex-start" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
