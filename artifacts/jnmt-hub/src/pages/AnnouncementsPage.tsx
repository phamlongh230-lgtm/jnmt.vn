import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";
import { getToken } from "@/lib/auth";

interface Announcement {
  id: number;
  title: string;
  content: string;
  authorUsername: string;
  isPinned: boolean;
  createdAt: string;
}

export default function AnnouncementsPage() {
  const { isDark, currentUser, showToast, lang } = useApp();
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = currentUser?.role === "admin";

  const border = isDark ? "#334155" : "#e2e8f0";
  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const text2 = isDark ? "#94a3b8" : "#64748b";
  const inputBg = isDark ? "#0f172a" : "#f8fafc";

  const load = () => {
    fetch("/api/announcements").then((r) => r.json()).then((d) => { setItems(d); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      const r = await fetch("/api/announcements", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }, body: JSON.stringify({ title, content, isPinned }) });
      if (r.ok) { showToast(t(lang, "announcement_posted_ok"), "success"); setTitle(""); setContent(""); setIsPinned(false); setShowForm(false); load(); }
      else { const e = await r.json(); showToast(e.error || t(lang, "error_generic"), "error"); }
    } finally { setSubmitting(false); }
  };

  const del = async (id: number) => {
    if (!confirm(t(lang, "confirm_delete_announcement"))) return;
    await fetch(`/api/announcements/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
    showToast(t(lang, "deleted_ok"), "success");
    load();
  };

  const pin = async (id: number) => {
    await fetch(`/api/announcements/${id}/pin`, { method: "PUT", headers: { Authorization: `Bearer ${getToken()}` } });
    load();
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "1.5rem 1rem" }} className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#2563eb", margin: 0 }}>📢 {t(lang, "announcements_board")}</h1>
          <p style={{ color: text2, fontSize: "0.82rem", margin: 0, marginTop: 2 }}>{t(lang, "announcements_subtitle")}</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowForm((v) => !v)} style={{ padding: "0.6rem 1.1rem", background: "#2563eb", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: "0.85rem" }}>
            {showForm ? `✕ ${t(lang, "close")}` : `+ ${t(lang, "add_announcement")}`}
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <div className="glass" style={{ borderRadius: 12, padding: "1.25rem", marginBottom: "1rem" }}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t(lang, "announcement_title_ph")} style={{ width: "100%", padding: "0.7rem", border: `1px solid ${border}`, borderRadius: 8, background: inputBg, color: textCol, fontSize: "0.95rem", marginBottom: "0.75rem", outline: "none", boxSizing: "border-box" }} />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder={t(lang, "announcement_content_ph")} rows={4} style={{ width: "100%", padding: "0.7rem", border: `1px solid ${border}`, borderRadius: 8, background: inputBg, color: textCol, fontSize: "0.9rem", resize: "vertical", outline: "none", boxSizing: "border-box", marginBottom: "0.75rem" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", color: textCol, cursor: "pointer" }}>
              <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} /> {t(lang, "pin_to_top")}
            </label>
            <button onClick={submit} disabled={submitting} style={{ padding: "0.6rem 1.25rem", background: "#2563eb", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: "0.9rem", opacity: submitting ? 0.6 : 1 }}>
              {submitting ? "..." : t(lang, "post")}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", color: text2, padding: "3rem" }}>{t(lang, "loading")}</div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: "center", color: text2, padding: "3rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📭</div>
          <p>{t(lang, "no_announcements")}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {items.map((item) => (
            <div key={item.id} className="glass" style={{ borderRadius: 12, overflow: "hidden", borderLeft: item.isPinned ? "4px solid #2563eb" : undefined }}>
              <div style={{ padding: "1rem 1.1rem", cursor: "pointer" }} onClick={() => setExpanded(expanded === item.id ? null : item.id)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                      {item.isPinned && <span style={{ fontSize: "0.65rem", background: "#2563eb", color: "white", padding: "0.15rem 0.4rem", borderRadius: 4, fontWeight: 700 }}>📌 {t(lang, "pinned_label")}</span>}
                      <span style={{ fontWeight: 700, color: textCol, fontSize: "0.95rem" }}>{item.title}</span>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: text2 }}>👤 {item.authorUsername} · {formatDate(item.createdAt)}</div>
                  </div>
                  <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                    {isAdmin && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); pin(item.id); }} title={t(lang, "pin_to_top")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.9rem", opacity: 0.6 }}>📌</button>
                        <button onClick={(e) => { e.stopPropagation(); del(item.id); }} title={t(lang, "delete")} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: "0.9rem" }}>🗑️</button>
                      </>
                    )}
                    <span style={{ color: text2, fontSize: "0.9rem" }}>{expanded === item.id ? "▲" : "▼"}</span>
                  </div>
                </div>
              </div>
              {expanded === item.id && (
                <div style={{ padding: "0 1.1rem 1rem", borderTop: `1px solid ${border}`, paddingTop: "0.75rem" }}>
                  <p style={{ color: textCol, fontSize: "0.9rem", lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0 }}>{item.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
