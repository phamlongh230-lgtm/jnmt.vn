import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { t, LangCode } from "@/lib/i18n";

interface Note {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  done: boolean;
  content: string;
  createdAt: string;
}

const LS_KEY = "jnmt_notes";

function loadNotes(): Note[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); }
  catch { return []; }
}
function saveNotes(notes: Note[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(notes));
}

const PRIORITY_COLORS: Record<string, { bg: string; text: string; border: string; darkBg: string }> = {
  high:   { bg: "#fef2f2", text: "#dc2626", border: "#fecaca", darkBg: "#2d1111" },
  medium: { bg: "#fffbeb", text: "#d97706", border: "#fde68a", darkBg: "#2d2211" },
  low:    { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0", darkBg: "#112d1b" },
};

const SUBJECTS = [
  "subj_korean","subj_math","subj_science","subj_english",
  "subj_history","subj_art","subj_pe","subj_other",
];

const SUBJECT_ICONS: Record<string, string> = {
  subj_korean: "🇰🇷", subj_math: "📐", subj_science: "🔬",
  subj_english: "🇬🇧", subj_history: "📜", subj_art: "🎨",
  subj_pe: "⚽", subj_other: "📌",
};

function getDueInfo(dueDate: string, lang: LangCode): { label: string; color: string } | null {
  if (!dueDate) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  const due = new Date(dueDate + "T00:00:00"); due.setHours(0,0,0,0);
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (diff < 0)  return { label: t(lang, "notes_overdue"),   color: "#ef4444" };
  if (diff === 0) return { label: t(lang, "notes_due_today"), color: "#f59e0b" };
  if (diff === 1) return { label: t(lang, "notes_due_tomorrow"), color: "#f97316" };
  return { label: t(lang, "notes_in").replace("{n}", String(diff)), color: "#64748b" };
}

const DEFAULT_FORM = {
  title: "", subject: "subj_korean", dueDate: "",
  priority: "medium" as Note["priority"], content: "",
};

export default function NotesPage() {
  const { lang, isDark } = useApp();
  const [notes, setNotes] = useState<Note[]>(loadNotes);
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [form, setForm] = useState({ ...DEFAULT_FORM });

  const text  = isDark ? "#f1f5f9" : "#0f172a";
  const text2 = isDark ? "#94a3b8" : "#64748b";
  const border = isDark ? "#334155" : "#e2e8f0";
  const inputBg = isDark ? "#0f172a" : "#f8fafc";

  const doneCount    = notes.filter((n) => n.done).length;
  const pendingCount = notes.length - doneCount;

  const filtered = useMemo(() => {
    const sorted = [...notes].sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      const pp: Record<string, number> = { high: 0, medium: 1, low: 2 };
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return pp[a.priority] - pp[b.priority];
    });
    if (filter === "pending") return sorted.filter((n) => !n.done);
    if (filter === "done")    return sorted.filter((n) => n.done);
    return sorted;
  }, [notes, filter]);

  function openAdd() {
    setForm({ ...DEFAULT_FORM });
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(note: Note) {
    setForm({ title: note.title, subject: note.subject, dueDate: note.dueDate, priority: note.priority, content: note.content });
    setEditing(note);
    setModalOpen(true);
  }

  function saveNote() {
    if (!form.title.trim()) return;
    const updated = editing
      ? notes.map((n) => n.id === editing.id ? { ...n, ...form } : n)
      : [...notes, { id: Date.now().toString(), ...form, done: false, createdAt: new Date().toISOString() }];
    setNotes(updated);
    saveNotes(updated);
    setModalOpen(false);
  }

  function toggleDone(id: string) {
    const updated = notes.map((n) => n.id === id ? { ...n, done: !n.done } : n);
    setNotes(updated); saveNotes(updated);
  }

  function deleteNote(id: string) {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated); saveNotes(updated);
  }

  const FILTERS: { key: "all" | "pending" | "done"; count: number }[] = [
    { key: "all",     count: notes.length },
    { key: "pending", count: pendingCount },
    { key: "done",    count: doneCount },
  ];

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "1.5rem 1rem" }} className="animate-fade-in">

      {/* Hero */}
      <div className="glass-hero" style={{ background: "rgba(37,99,235,0.55)", borderRadius: 22, padding: "1.75rem 2rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 900, marginBottom: "0.25rem" }}>
              📓 {t(lang, "notes_page")}
            </h1>
            {notes.length > 0 && (
              <p style={{ opacity: 0.85, fontSize: "0.88rem" }}>
                {doneCount}/{notes.length} {t(lang, "notes_filter_done").toLowerCase()}
                {pendingCount > 0 && (
                  <span style={{ marginLeft: "0.5rem", background: "rgba(255,255,255,0.22)", padding: "0.1rem 0.5rem", borderRadius: 100, fontSize: "0.78rem" }}>
                    {pendingCount} {t(lang, "notes_filter_pending").toLowerCase()}
                  </span>
                )}
              </p>
            )}
          </div>
          <button onClick={openAdd}
            style={{ background: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.45)", color: "white", padding: "0.6rem 1.4rem", borderRadius: 100, cursor: "pointer", fontWeight: 700, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.4rem", backdropFilter: "blur(8px)" }}>
            + {t(lang, "notes_add_new")}
          </button>
        </div>

        {/* Progress bar */}
        {notes.length > 0 && (
          <div style={{ marginTop: "1rem", background: "rgba(255,255,255,0.2)", borderRadius: 100, height: 6, overflow: "hidden" }}>
            <div style={{ height: "100%", background: "rgba(255,255,255,0.85)", borderRadius: 100, width: `${(doneCount / notes.length) * 100}%`, transition: "width 0.4s ease" }} />
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div className="glass" style={{ borderRadius: 14, padding: "0.4rem", marginBottom: "1.25rem", display: "flex", gap: "0.25rem" }}>
        {FILTERS.map(({ key, count }) => (
          <button key={key} onClick={() => setFilter(key)}
            style={{ flex: 1, padding: "0.55rem 0.25rem", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: filter === key ? 700 : 500, fontSize: "0.85rem", background: filter === key ? (isDark ? "rgba(37,99,235,0.35)" : "#eff6ff") : "transparent", color: filter === key ? "#2563eb" : text2, transition: "all 0.15s" }}>
            {t(lang, `notes_filter_${key}`)}
            <span style={{ marginLeft: "0.3rem", fontSize: "0.75rem", opacity: 0.8 }}>({count})</span>
          </button>
        ))}
      </div>

      {/* Notes list */}
      {filtered.length === 0 ? (
        <div className="glass" style={{ borderRadius: 18, padding: "3rem 2rem", textAlign: "center", color: text2 }}>
          <div style={{ fontSize: "3.5rem", marginBottom: "0.75rem" }}>📝</div>
          <p style={{ fontSize: "0.95rem" }}>{t(lang, "notes_empty")}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {filtered.map((note) => {
            const pc = PRIORITY_COLORS[note.priority];
            const dueInfo = getDueInfo(note.dueDate, lang);
            return (
              <div key={note.id} className="glass"
                style={{ borderRadius: 16, padding: "0.9rem 1.1rem", borderLeft: `4px solid ${pc.text}`, opacity: note.done ? 0.6 : 1, transition: "opacity 0.2s" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>

                  {/* Checkbox */}
                  <button onClick={() => toggleDone(note.id)}
                    style={{ width: 23, height: 23, borderRadius: 6, border: `2px solid ${note.done ? "#10b981" : border}`, background: note.done ? "#10b981" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, marginTop: 2, transition: "all 0.15s" }}>
                    {note.done && <span style={{ color: "white", fontSize: "0.7rem", fontWeight: 900, lineHeight: 1 }}>✓</span>}
                  </button>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Title */}
                    <div style={{ fontWeight: 700, color: text, fontSize: "0.95rem", textDecoration: note.done ? "line-through" : "none", marginBottom: "0.4rem", wordBreak: "break-word" }}>
                      {note.title}
                    </div>

                    {/* Badges row */}
                    <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", alignItems: "center" }}>
                      {/* Subject */}
                      <span style={{ fontSize: "0.72rem", background: isDark ? "#1e293b" : "#f1f5f9", color: text2, padding: "0.15rem 0.5rem", borderRadius: 100, border: `1px solid ${border}`, display: "flex", alignItems: "center", gap: "0.2rem" }}>
                        {SUBJECT_ICONS[note.subject]} {t(lang, note.subject)}
                      </span>
                      {/* Priority */}
                      <span style={{ fontSize: "0.72rem", background: isDark ? pc.darkBg : pc.bg, color: pc.text, padding: "0.15rem 0.5rem", borderRadius: 100, border: `1px solid ${pc.border}`, fontWeight: 600 }}>
                        {t(lang, `notes_${note.priority}`)}
                      </span>
                      {/* Due */}
                      {dueInfo && (
                        <span style={{ fontSize: "0.72rem", color: dueInfo.color, fontWeight: 600, display: "flex", alignItems: "center", gap: "0.2rem" }}>
                          📅 {dueInfo.label}
                          {note.dueDate && (
                            <span style={{ color: text2, fontWeight: 400 }}>· {note.dueDate}</span>
                          )}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    {note.content.trim() && (
                      <div style={{ marginTop: "0.5rem", fontSize: "0.82rem", color: text2, lineHeight: 1.55, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        {note.content}
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", flexShrink: 0 }}>
                    <button onClick={() => openEdit(note)}
                      style={{ background: "none", border: `1px solid ${border}`, color: text2, width: 30, height: 30, borderRadius: 8, cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      ✏️
                    </button>
                    <button onClick={() => deleteNote(note.id)}
                      style={{ background: "none", border: `1px solid ${border}`, color: "#ef4444", width: 30, height: 30, borderRadius: 8, cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <>
          <div onClick={() => setModalOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.52)", zIndex: 500, backdropFilter: "blur(3px)" }} />
          <div className="glass-panel"
            style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", borderRadius: 22, padding: "1.75rem", width: "min(500px, 94vw)", zIndex: 600, maxHeight: "90vh", overflowY: "auto" }}>

            <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: text, marginBottom: "1.25rem" }}>
              {editing ? `✏️ ${t(lang, "edit")}` : `📓 ${t(lang, "notes_add_new")}`}
            </h2>

            {/* Title */}
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={t(lang, "notes_title_ph")}
              autoFocus
              style={{ width: "100%", padding: "0.75rem 0.85rem", border: `1.5px solid ${border}`, borderRadius: 10, background: inputBg, color: text, fontSize: "0.95rem", marginBottom: "0.85rem", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
            />

            {/* Subject + Priority */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.85rem" }}>
              <div>
                <label style={{ fontSize: "0.75rem", color: text2, fontWeight: 600, display: "block", marginBottom: "0.35rem" }}>
                  {t(lang, "notes_subject")}
                </label>
                <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  style={{ width: "100%", padding: "0.6rem 0.75rem", border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: text, fontSize: "0.85rem", outline: "none", cursor: "pointer" }}>
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>{SUBJECT_ICONS[s]} {t(lang, s)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "0.75rem", color: text2, fontWeight: 600, display: "block", marginBottom: "0.35rem" }}>
                  {t(lang, "notes_priority")}
                </label>
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Note["priority"] })}
                  style={{ width: "100%", padding: "0.6rem 0.75rem", border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: text, fontSize: "0.85rem", outline: "none", cursor: "pointer" }}>
                  {(["high", "medium", "low"] as const).map((p) => (
                    <option key={p} value={p}>{t(lang, `notes_${p}`)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Due date */}
            <div style={{ marginBottom: "0.85rem" }}>
              <label style={{ fontSize: "0.75rem", color: text2, fontWeight: 600, display: "block", marginBottom: "0.35rem" }}>
                📅 {t(lang, "notes_due_date")}
              </label>
              <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                style={{ width: "100%", padding: "0.6rem 0.75rem", border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: text, fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }} />
            </div>

            {/* Content */}
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder={t(lang, "notes_content_ph")}
              rows={3}
              style={{ width: "100%", padding: "0.75rem 0.85rem", border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: text, fontSize: "0.88rem", marginBottom: "1.25rem", outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit", lineHeight: 1.5 }}
            />

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button onClick={() => setModalOpen(false)}
                style={{ padding: "0.6rem 1.1rem", background: "none", border: `1px solid ${border}`, borderRadius: 9, color: text2, cursor: "pointer", fontSize: "0.9rem" }}>
                {t(lang, "cancel")}
              </button>
              <button disabled={!form.title.trim()} onClick={saveNote}
                style={{ padding: "0.6rem 1.4rem", background: "#2563eb", color: "white", border: "none", borderRadius: 9, cursor: "pointer", fontWeight: 700, fontSize: "0.9rem", opacity: form.title.trim() ? 1 : 0.45, transition: "opacity 0.15s" }}>
                {t(lang, "save")}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
