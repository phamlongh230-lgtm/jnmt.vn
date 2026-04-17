import { useState, useEffect, useRef, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

interface School {
  id: number;
  name: string;
  nameKo: string | null;
  nameEn: string | null;
  slug: string;
  link: string | null;
  type: string;
  city: string | null;
  country: string;
  description: string | null;
}

// Pinned suggestion — always shown at top when input is empty & focused
const PINNED: School = {
  id: -1,
  name: "전남미래국제고등학교",
  nameKo: "전남미래국제고등학교",
  nameEn: "Jeonnam Future International High School",
  slug: "jnmt",
  link: "https://www.jnmt.vn",
  type: "high_school",
  city: "Gangjin-gun, Jeollanam-do",
  country: "KR",
  description: "Trường của bạn · 학생 포털",
};

const TYPE_LABELS: Record<string, string> = {
  university: "Đại học",
  college: "Cao đẳng",
  high_school: "THPT",
  vocational: "Nghề",
  other: "Khác",
};

const TYPE_COLORS: Record<string, string> = {
  university: "#2563eb",
  college: "#7c3aed",
  high_school: "#059669",
  vocational: "#d97706",
  other: "#64748b",
};

const COUNTRY_FLAGS: Record<string, string> = {
  KR: "🇰🇷",
  VN: "🇻🇳",
  MN: "🇲🇳",
  US: "🇺🇸",
  JP: "🇯🇵",
};

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function SchoolSearch() {
  const { isDark, lang } = useApp();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 250);

  // Fetch từ API
  const fetchSchools = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/schools/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error("API error");
      const data: School[] = await res.json();
      setResults(data);
      setOpen(true);
      setActiveIdx(-1);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchools(debouncedQuery);
  }, [debouncedQuery, fetchSchools]);

  // Click ngoài → đóng dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      handleSelect(results[activeIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  // Scroll active item into view
  useEffect(() => {
    if (activeIdx >= 0 && listRef.current) {
      const item = listRef.current.children[activeIdx] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIdx]);

  function handleSelect(school: School) {
    setSelectedSchool(school);
    setQuery(school.name);
    setOpen(false);
    setResults([]);
  }

  function handleVisit() {
    if (selectedSchool?.link) {
      window.open(selectedSchool.link, "_blank", "noopener,noreferrer");
    }
  }

  function handleClear() {
    setQuery("");
    setSelectedSchool(null);
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  }

  // Colors
  const bg = isDark ? "#1e293b" : "white";
  const border = isDark ? "#334155" : "#e2e8f0";
  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const text2 = isDark ? "#94a3b8" : "#64748b";
  const hoverBg = isDark ? "#0f172a" : "#f0f7ff";

  return (
    <div style={{ width: "100%" }} ref={containerRef}>
      {/* Search input */}
      <div style={{ position: "relative" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          background: bg,
          border: `2px solid ${open ? "#2563eb" : border}`,
          borderRadius: selectedSchool ? "12px 12px 0 0" : 12,
          padding: "0.65rem 1rem",
          gap: "0.6rem",
          transition: "border-color 0.15s, box-shadow 0.15s",
          boxShadow: open ? "0 0 0 3px rgba(37,99,235,0.15)" : "none",
        }}>
          <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>
            {loading ? "⏳" : "🔍"}
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedSchool(null);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setOpen(true)}
            placeholder={t(lang, "school_search_ph")}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: "1rem",
              color: textCol,
              fontFamily: "inherit",
            }}
          />
          {query && (
            <button
              onClick={handleClear}
              title="Xóa"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: text2,
                fontSize: "1rem",
                lineHeight: 1,
                padding: "0.1rem",
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Dropdown kết quả */}
        {open && (
          <ul
            ref={listRef}
            className="glass"
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              border: `2px solid #2563eb`,
              borderTop: "none",
              borderRadius: "0 0 12px 12px",
              listStyle: "none",
              margin: 0,
              padding: "0.25rem 0",
              maxHeight: 320,
              overflowY: "auto",
              zIndex: 200,
            }}
          >
            {!query.trim() ? (
              /* Empty state: show pinned school as suggestion */
              <>
                <li style={{ padding: "0.3rem 1rem 0.15rem", fontSize: "0.65rem", fontWeight: 800, color: text2, textTransform: "uppercase", letterSpacing: 1 }}>
                  ⭐ Trường của bạn
                </li>
                <li
                  onMouseDown={() => handleSelect(PINNED)}
                  style={{ padding: "0.75rem 1rem", cursor: "pointer", background: isDark ? "#1e3a5f" : "#eff6ff", display: "flex", alignItems: "center", gap: "0.75rem", borderLeft: "3px solid #2563eb" }}
                >
                  <div style={{ flexShrink: 0, textAlign: "center" }}>
                    <div style={{ fontSize: "1.3rem" }}>🇰🇷</div>
                    <div style={{ fontSize: "0.6rem", fontWeight: 700, color: TYPE_COLORS.high_school, background: TYPE_COLORS.high_school + "18", padding: "0.05rem 0.3rem", borderRadius: 4, marginTop: "0.1rem", whiteSpace: "nowrap" }}>THPT</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, color: "#2563eb", fontSize: "0.95rem", marginBottom: "0.1rem" }}>{PINNED.name}</div>
                    <div style={{ fontSize: "0.78rem", color: text2, marginBottom: "0.1rem", fontStyle: "italic" }}>{PINNED.nameEn}</div>
                    <div style={{ fontSize: "0.75rem", color: text2 }}>📍 {PINNED.city} · {PINNED.description}</div>
                  </div>
                  <span style={{ fontSize: "0.8rem", color: "#2563eb", flexShrink: 0 }}>→</span>
                </li>
                <li style={{ padding: "0.5rem 1rem", fontSize: "0.78rem", color: text2, textAlign: "center" }}>
                  Gõ để tìm kiếm trường khác...
                </li>
              </>
            ) : results.length === 0 ? (
              <li style={{ padding: "1rem", color: text2, textAlign: "center", fontSize: "0.9rem" }}>
                😕 Không tìm thấy trường nào khớp với "{query}"
              </li>
            ) : (
              <>
                {/* Always prepend pinned if query matches */}
                {(PINNED.name.toLowerCase().includes(query.toLowerCase()) || (PINNED.nameEn ?? "").toLowerCase().includes(query.toLowerCase())) &&
                  !results.find((r) => r.id === PINNED.id) && (
                  <li
                    onMouseDown={() => handleSelect(PINNED)}
                    style={{ padding: "0.75rem 1rem", cursor: "pointer", background: isDark ? "#1e3a5f" : "#eff6ff", display: "flex", alignItems: "center", gap: "0.75rem", borderLeft: "3px solid #2563eb", borderBottom: `1px solid ${border}` }}
                  >
                    <div style={{ flexShrink: 0, textAlign: "center" }}>
                      <div style={{ fontSize: "1.3rem" }}>🇰🇷</div>
                      <div style={{ fontSize: "0.6rem", fontWeight: 700, color: TYPE_COLORS.high_school, background: TYPE_COLORS.high_school + "18", padding: "0.05rem 0.3rem", borderRadius: 4, marginTop: "0.1rem" }}>THPT</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <span style={{ fontWeight: 800, color: "#2563eb", fontSize: "0.95rem" }}>{PINNED.name}</span>
                        <span style={{ fontSize: "0.6rem", background: "#2563eb", color: "white", padding: "0.1rem 0.35rem", borderRadius: 4, fontWeight: 700 }}>⭐ Trường bạn</span>
                      </div>
                      <div style={{ fontSize: "0.75rem", color: text2 }}>📍 {PINNED.city}</div>
                    </div>
                    <span style={{ fontSize: "0.8rem", color: "#2563eb", flexShrink: 0 }}>→</span>
                  </li>
                )}
                {results.map((school, idx) => (
                  <li
                    key={school.id}
                    onMouseDown={() => handleSelect(school)}
                    onMouseEnter={() => setActiveIdx(idx)}
                    style={{
                      padding: "0.75rem 1rem",
                      cursor: "pointer",
                      background: idx === activeIdx ? hoverBg : "transparent",
                      transition: "background 0.1s",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      borderBottom: idx < results.length - 1 ? `1px solid ${border}` : "none",
                    }}
                  >
                    <div style={{ flexShrink: 0, textAlign: "center" }}>
                      <div style={{ fontSize: "1.3rem" }}>{COUNTRY_FLAGS[school.country] ?? "🌐"}</div>
                      <div style={{ fontSize: "0.6rem", fontWeight: 700, color: TYPE_COLORS[school.type] ?? "#64748b", background: `${TYPE_COLORS[school.type]}18`, padding: "0.05rem 0.3rem", borderRadius: 4, marginTop: "0.1rem", whiteSpace: "nowrap" }}>
                        {TYPE_LABELS[school.type] ?? school.type}
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: textCol, fontSize: "0.95rem", marginBottom: "0.1rem" }}>{school.name}</div>
                      {(school.nameKo || school.nameEn) && (
                        <div style={{ fontSize: "0.78rem", color: text2, marginBottom: "0.1rem" }}>
                          {school.nameKo && <span style={{ marginRight: "0.5rem" }}>{school.nameKo}</span>}
                          {school.nameEn && <span style={{ fontStyle: "italic" }}>{school.nameEn}</span>}
                        </div>
                      )}
                      {school.city && (
                        <div style={{ fontSize: "0.75rem", color: text2 }}>
                          📍 {school.city}{school.description && <span style={{ marginLeft: "0.4rem" }}>· {school.description}</span>}
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: "0.8rem", color: "#2563eb", flexShrink: 0 }}>→</span>
                  </li>
                ))}
              </>
            )}
          </ul>
        )}
      </div>

      {/* Card chi tiết khi đã chọn */}
      {selectedSchool && !open && (
        <div style={{
          background: isDark ? "#0f172a" : "#f0f7ff",
          border: `2px solid #2563eb`,
          borderTop: "none",
          borderRadius: "0 0 12px 12px",
          padding: "1rem 1.25rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
        }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
              <span style={{ fontSize: "1.4rem" }}>{COUNTRY_FLAGS[selectedSchool.country] ?? "🌐"}</span>
              <span style={{ fontWeight: 800, color: "#2563eb", fontSize: "1rem" }}>{selectedSchool.name}</span>
              <span style={{
                fontSize: "0.65rem",
                fontWeight: 700,
                color: TYPE_COLORS[selectedSchool.type] ?? "#64748b",
                background: `${TYPE_COLORS[selectedSchool.type]}25`,
                padding: "0.1rem 0.5rem",
                borderRadius: 20,
              }}>
                {TYPE_LABELS[selectedSchool.type]}
              </span>
            </div>
            {selectedSchool.nameKo && (
              <div style={{ fontSize: "0.82rem", color: text2, marginBottom: "0.15rem" }}>{selectedSchool.nameKo}</div>
            )}
            {selectedSchool.nameEn && (
              <div style={{ fontSize: "0.8rem", color: text2, fontStyle: "italic", marginBottom: "0.15rem" }}>{selectedSchool.nameEn}</div>
            )}
            {selectedSchool.city && (
              <div style={{ fontSize: "0.78rem", color: text2 }}>📍 {selectedSchool.city} · {selectedSchool.country}</div>
            )}
            {selectedSchool.description && (
              <div style={{ fontSize: "0.78rem", color: textCol, marginTop: "0.3rem", opacity: 0.85 }}>{selectedSchool.description}</div>
            )}
          </div>

          {selectedSchool.link && (
            <button
              onClick={handleVisit}
              style={{
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                color: "white",
                border: "none",
                borderRadius: 8,
                padding: "0.6rem 1.2rem",
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                boxShadow: "0 2px 8px rgba(37,99,235,0.35)",
                flexShrink: 0,
              }}
            >
              🌐 Truy cập website
            </button>
          )}
        </div>
      )}
    </div>
  );
}
