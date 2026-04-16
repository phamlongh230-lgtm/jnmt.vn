import { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

interface TenorGif {
  id: string;
  title: string;
  media_formats: {
    tinygif: { url: string };
    gif: { url: string };
  };
}

interface Props {
  onSelect: (url: string) => void;
  onClose: () => void;
}

const TENOR_KEY = "LIVDSRZULELA"; // Tenor public demo key

export default function GifPicker({ onSelect, onClose }: Props) {
  const { isDark, lang } = useApp();
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState<TenorGif[]>([]);
  const [loading, setLoading] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const bg = isDark ? "#1e293b" : "white";
  const border = isDark ? "#334155" : "#e2e8f0";
  const inputBg = isDark ? "#0f172a" : "#f8fafc";
  const textCol = isDark ? "#f1f5f9" : "#0f172a";

  const fetchGifs = async (q: string) => {
    setLoading(true);
    try {
      const endpoint = q.trim()
        ? `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(q)}&key=${TENOR_KEY}&limit=20&media_filter=tinygif,gif`
        : `https://tenor.googleapis.com/v2/featured?key=${TENOR_KEY}&limit=20&media_filter=tinygif,gif`;
      const res = await fetch(endpoint);
      const data = await res.json();
      setGifs(data.results || []);
    } catch {
      setGifs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGifs("");
  }, []);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => fetchGifs(query), 400);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute", bottom: "calc(100% + 8px)", left: 0, right: 0,
        background: bg, border: `1px solid ${border}`, borderRadius: 12,
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)", zIndex: 100, overflow: "hidden",
      }}
    >
      <div style={{ padding: "0.6rem" }}>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t(lang, "gif_search_ph")}
          style={{
            width: "100%", padding: "0.5rem 0.75rem", border: `1px solid ${border}`,
            borderRadius: 8, background: inputBg, color: textCol, fontSize: "0.85rem",
            outline: "none", boxSizing: "border-box",
          }}
        />
      </div>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4,
        padding: "0 0.6rem 0.6rem", maxHeight: 260, overflowY: "auto",
      }}>
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ aspectRatio: "1", borderRadius: 6, background: isDark ? "#0f172a" : "#e2e8f0", animation: "skeleton-pulse 1.5s ease-in-out infinite" }} />
          ))
        ) : gifs.length === 0 ? (
          <div style={{ gridColumn: "1/-1", textAlign: "center", color: isDark ? "#94a3b8" : "#64748b", padding: "1.5rem", fontSize: "0.85rem" }}>
            {t(lang, "gif_not_found")}
          </div>
        ) : (
          gifs.map((gif) => (
            <button
              key={gif.id}
              onClick={() => { onSelect(gif.media_formats.gif.url); onClose(); }}
              style={{ padding: 0, border: "none", borderRadius: 6, overflow: "hidden", cursor: "pointer", aspectRatio: "1", background: "transparent" }}
              title={gif.title}
            >
              <img
                src={gif.media_formats.tinygif.url}
                alt={gif.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                loading="lazy"
              />
            </button>
          ))
        )}
      </div>
      <div style={{ padding: "0.3rem 0.6rem", borderTop: `1px solid ${border}`, fontSize: "0.7rem", color: isDark ? "#475569" : "#94a3b8", textAlign: "right" }}>
        Powered by Tenor
      </div>
    </div>
  );
}
