import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";
import { getToken } from "@/lib/auth";

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  avatarColor: string;
  classGroup: string | null;
  createdAt: string;
  lastLogin: string | null;
}

interface TinkercadClass {
  id: number;
  name: string;
  classCode: string;
  tinkercadUrl: string;
  createdAt: string;
}

const ROLE_COLORS: Record<string, string> = { admin: "#7c3aed", moderator: "#2563eb", user: "#64748b" };
const ROLE_LABELS: Record<string, string> = { admin: "Admin", moderator: "Mod", user: "User" };

export default function AdminPage() {
  const { isDark, currentUser, showToast, lang } = useApp();
  const [activeTab, setActiveTab] = useState<"users" | "tinkercad">("users");

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const [classes, setClasses] = useState<TinkercadClass[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [editingClass, setEditingClass] = useState<TinkercadClass | null>(null);
  const [showNewClass, setShowNewClass] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [classErr, setClassErr] = useState("");
  const [classSaving, setClassSaving] = useState(false);

  const border = isDark ? "#334155" : "#e2e8f0";
  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const text2 = isDark ? "#94a3b8" : "#64748b";
  const inputBg = isDark ? "#0f172a" : "#f8fafc";

  if (currentUser?.role !== "admin") return (
    <div style={{ textAlign: "center", padding: "4rem 1rem", color: text2 }}>
      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
      <p style={{ fontWeight: 700 }}>{t(lang, "admin_only")}</p>
    </div>
  );

  const authHeaders = { Authorization: `Bearer ${getToken()}` };

  const loadUsers = () => {
    fetch("/api/admin/users", { headers: authHeaders })
      .then((r) => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
      .then((d) => { setUsers(Array.isArray(d) ? d : []); })
      .catch(() => { setUsers([]); })
      .finally(() => setLoadingUsers(false));
  };

  const loadClasses = () => {
    fetch("/api/tinkercad/classes", { headers: authHeaders })
      .then((r) => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
      .then((d) => { setClasses(Array.isArray(d) ? d : []); })
      .catch(() => { setClasses([]); })
      .finally(() => setLoadingClasses(false));
  };

  useEffect(() => { loadUsers(); loadClasses(); }, []);

  const updateUser = async (id: number, updates: Record<string, unknown>) => {
    setSaving(id);
    try {
      const r = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(updates),
      });
      if (r.ok) {
        setUsers((prev) => prev.map((u) => u.id === id ? { ...u, ...updates } : u));
        showToast(t(lang, "updated_ok"), "success");
      } else {
        const e = await r.json();
        showToast(e.error || t(lang, "error_generic"), "error");
      }
    } finally { setSaving(null); }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return !q || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString("vi-VN") : "—";

  const createClass = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setClassErr("");
    setClassSaving(true);
    try {
      const r = await fetch("/api/tinkercad/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ name: newName, classCode: newCode, tinkercadUrl: newUrl }),
      });
      const d = await r.json();
      if (!r.ok) { setClassErr(d.error || t(lang, "error_generic")); return; }
      setClasses((prev) => [d, ...prev]);
      setShowNewClass(false); setNewName(""); setNewCode(""); setNewUrl("");
      showToast(t(lang, "class_created_ok"), "success");
    } finally { setClassSaving(false); }
  };

  const saveEditClass = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingClass) return;
    setClassSaving(true);
    try {
      const r = await fetch(`/api/tinkercad/classes/${editingClass.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ name: editingClass.name, tinkercadUrl: editingClass.tinkercadUrl }),
      });
      const d = await r.json();
      if (!r.ok) { showToast(d.error || t(lang, "error_generic"), "error"); return; }
      setClasses((prev) => prev.map((c) => c.id === d.id ? d : c));
      setEditingClass(null);
      showToast(t(lang, "class_updated_ok"), "success");
    } finally { setClassSaving(false); }
  };

  const deleteClass = async (id: number, name: string) => {
    if (!confirm(`${t(lang, "confirm_delete_class")} "${name}"`)) return;
    const r = await fetch(`/api/tinkercad/classes/${id}`, { method: "DELETE", headers: authHeaders });
    if (r.ok) { setClasses((prev) => prev.filter((c) => c.id !== id)); showToast(t(lang, "deleted_ok"), "success"); }
  };

  const inputStyle: React.CSSProperties = { width: "100%", padding: "0.6rem 0.85rem", border: `1px solid ${border}`, borderRadius: 8, background: inputBg, color: textCol, fontSize: "0.88rem", outline: "none", boxSizing: "border-box" };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "1.5rem 1rem" }} className="animate-fade-in">
      <div className="glass-hero" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.80) 0%, rgba(168,85,247,0.70) 100%)", borderRadius: 22,  padding: "1.5rem", color: "white", marginBottom: "1.25rem" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 900, margin: 0, marginBottom: "0.25rem" }}>⚙️ {t(lang, "admin_page")}</h1>
        <p style={{ margin: 0, opacity: 0.85, fontSize: "0.85rem" }}>{users.length} {t(lang, "username")} · {classes.length} {t(lang, "tinkercad_class_list")}</p>
      </div>

      <div style={{ display: "flex", borderBottom: `2px solid ${border}`, marginBottom: "1.25rem", gap: "0.25rem" }}>
        {([["users", `👥 ${t(lang, "users_tab")}`], ["tinkercad", "🔧 Tinkercad"]] as const).map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding: "0.6rem 1.25rem", background: "none", border: "none", cursor: "pointer", fontWeight: activeTab === tab ? 700 : 400, fontSize: "0.9rem", color: activeTab === tab ? "#7c3aed" : text2, borderBottom: activeTab === tab ? "2px solid #7c3aed" : "2px solid transparent", marginBottom: -2, transition: "all 0.15s" }}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === "users" && (
        <>
          <div style={{ marginBottom: "1rem" }}>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`🔍 ${t(lang, "search_users")}`}
              style={{ width: "100%", padding: "0.7rem 1rem", border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: textCol, fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }} />
          </div>

          {loadingUsers ? (
            <div style={{ textAlign: "center", color: text2, padding: "3rem" }}>{t(lang, "loading")}</div>
          ) : (
            <div className="glass" style={{ borderRadius: 18, overflow: "hidden" }}>
              {filtered.map((user, i) => (
                <div key={user.id} style={{ padding: "0.9rem 1rem", borderBottom: i < filtered.length - 1 ? `1px solid ${border}` : undefined, display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: user.avatarColor || "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "0.9rem", flexShrink: 0 }}>
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <span style={{ fontWeight: 700, color: textCol, fontSize: "0.9rem" }}>{user.username}</span>
                      <span style={{ fontSize: "0.65rem", background: ROLE_COLORS[user.role] + "20", color: ROLE_COLORS[user.role], padding: "0.1rem 0.4rem", borderRadius: 4, fontWeight: 700 }}>{ROLE_LABELS[user.role]}</span>
                      {!user.isActive && <span style={{ fontSize: "0.65rem", background: "#fef2f2", color: "#ef4444", padding: "0.1rem 0.4rem", borderRadius: 4, fontWeight: 700 }}>BAN</span>}
                      {user.classGroup && <span style={{ fontSize: "0.65rem", background: "#fff7ed", color: "#f97316", padding: "0.1rem 0.4rem", borderRadius: 4, fontWeight: 700 }}>🔧 {user.classGroup}</span>}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: text2 }}>{user.email}</div>
                    <div style={{ fontSize: "0.68rem", color: text2 }}>{t(lang, "joined_date")}: {formatDate(user.createdAt)} · {t(lang, "last_login_label")}: {formatDate(user.lastLogin)}</div>
                  </div>
                  {user.id !== currentUser?.id && (
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexShrink: 0, flexWrap: "wrap" }}>
                      <select value={user.classGroup || ""} onChange={(e) => updateUser(user.id, { classGroup: e.target.value || null })} disabled={saving === user.id}
                        style={{ padding: "0.4rem 0.5rem", border: `1px solid ${border}`, borderRadius: 6, background: inputBg, color: textCol, fontSize: "0.8rem", cursor: "pointer", maxWidth: 110 }}>
                        <option value="">{t(lang, "no_class_assigned")}</option>
                        {classes.map((c) => <option key={c.id} value={c.classCode}>{c.classCode}</option>)}
                      </select>
                      <select value={user.role} onChange={(e) => updateUser(user.id, { role: e.target.value })} disabled={saving === user.id}
                        style={{ padding: "0.4rem 0.5rem", border: `1px solid ${border}`, borderRadius: 6, background: inputBg, color: textCol, fontSize: "0.8rem", cursor: "pointer" }}>
                        <option value="user">User</option>
                        <option value="moderator">Mod</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button onClick={() => updateUser(user.id, { isActive: !user.isActive })} disabled={saving === user.id}
                        style={{ padding: "0.4rem 0.75rem", background: user.isActive ? "#fef2f2" : "#f0fdf4", color: user.isActive ? "#ef4444" : "#16a34a", border: `1px solid ${user.isActive ? "#fecaca" : "#bbf7d0"}`, borderRadius: 6, cursor: "pointer", fontSize: "0.8rem", fontWeight: 700 }}>
                        {saving === user.id ? "..." : user.isActive ? "Ban" : "Unban"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "tinkercad" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: textCol, margin: 0 }}>{t(lang, "tinkercad_class_list")}</h2>
            <button onClick={() => { setShowNewClass(true); setClassErr(""); }}
              style={{ padding: "0.5rem 1rem", background: "#f97316", color: "white", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}>
              + {t(lang, "add_class")}
            </button>
          </div>

          {showNewClass && (
            <div style={{ background: isDark ? "#0c2a1e" : "#f0fdf4", border: "1px solid #86efac", borderRadius: 12, padding: "1.25rem", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: isDark ? "#86efac" : "#166534", margin: "0 0 1rem" }}>{t(lang, "create_new_class")}</h3>
              <form onSubmit={createClass} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={{ fontSize: "0.78rem", fontWeight: 600, color: text2, display: "block", marginBottom: "0.3rem" }}>{t(lang, "class_name")}</label>
                    <input required value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="VD: Lớp 10A1" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.78rem", fontWeight: 600, color: text2, display: "block", marginBottom: "0.3rem" }}>{t(lang, "class_code_label")}</label>
                    <input required value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="VD: 10A1" style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, color: text2, display: "block", marginBottom: "0.3rem" }}>{t(lang, "tinkercad_link_label")}</label>
                  <input required type="url" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://www.tinkercad.com/joinclass/..." style={inputStyle} />
                </div>
                {classErr && <div style={{ fontSize: "0.83rem", color: "#ef4444" }}>{classErr}</div>}
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button type="submit" disabled={classSaving}
                    style={{ padding: "0.55rem 1.25rem", background: "#16a34a", color: "white", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}>
                    {classSaving ? t(lang, "saving") : t(lang, "create_class_btn")}
                  </button>
                  <button type="button" onClick={() => { setShowNewClass(false); setClassErr(""); }}
                    style={{ padding: "0.55rem 1rem", background: "none", color: text2, border: `1px solid ${border}`, borderRadius: 8, cursor: "pointer", fontSize: "0.85rem" }}>
                    {t(lang, "cancel")}
                  </button>
                </div>
              </form>
            </div>
          )}

          {loadingClasses ? (
            <div style={{ textAlign: "center", color: text2, padding: "3rem" }}>{t(lang, "loading")}</div>
          ) : classes.length === 0 ? (
            <div className="glass" style={{ textAlign: "center", color: text2, padding: "3rem", borderRadius: 12 }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔧</div>
              <div>{t(lang, "no_classes_yet")}</div>
            </div>
          ) : (
            <div className="glass" style={{ borderRadius: 18, overflow: "hidden" }}>
              {classes.map((cls, i) => (
                <div key={cls.id}>
                  {editingClass?.id === cls.id ? (
                    <form onSubmit={saveEditClass} style={{ padding: "1rem", borderBottom: i < classes.length - 1 ? `1px solid ${border}` : undefined, display: "flex", flexDirection: "column", gap: "0.7rem", background: isDark ? "#0f1d2e" : "#f8fafc" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0.75rem", alignItems: "end" }}>
                        <div>
                          <label style={{ fontSize: "0.75rem", fontWeight: 600, color: text2, display: "block", marginBottom: "0.25rem" }}>{t(lang, "class_name")}</label>
                          <input required value={editingClass.name} onChange={(e) => setEditingClass({ ...editingClass, name: e.target.value })} style={inputStyle} />
                        </div>
                        <div style={{ fontSize: "0.8rem", color: text2, paddingBottom: "0.6rem" }}>
                          Code: <strong>{cls.classCode}</strong>
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: "0.75rem", fontWeight: 600, color: text2, display: "block", marginBottom: "0.25rem" }}>{t(lang, "tinkercad_link_label")}</label>
                        <input required type="url" value={editingClass.tinkercadUrl} onChange={(e) => setEditingClass({ ...editingClass, tinkercadUrl: e.target.value })} style={inputStyle} />
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button type="submit" disabled={classSaving}
                          style={{ padding: "0.45rem 1rem", background: "#2563eb", color: "white", border: "none", borderRadius: 7, fontWeight: 700, cursor: "pointer", fontSize: "0.82rem" }}>
                          {classSaving ? t(lang, "saving") : t(lang, "save")}
                        </button>
                        <button type="button" onClick={() => setEditingClass(null)}
                          style={{ padding: "0.45rem 0.85rem", background: "none", color: text2, border: `1px solid ${border}`, borderRadius: 7, cursor: "pointer", fontSize: "0.82rem" }}>
                          {t(lang, "cancel")}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div style={{ padding: "0.9rem 1rem", borderBottom: i < classes.length - 1 ? `1px solid ${border}` : undefined, display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>🔧</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: textCol, fontSize: "0.9rem" }}>{cls.name}</div>
                        <div style={{ fontSize: "0.72rem", color: "#f97316", fontWeight: 600 }}>Code: {cls.classCode}</div>
                        <div style={{ fontSize: "0.7rem", color: text2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 400 }}>{cls.tinkercadUrl}</div>
                      </div>
                      <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
                        <button onClick={() => setEditingClass(cls)}
                          style={{ padding: "0.4rem 0.75rem", background: inputBg, color: textCol, border: `1px solid ${border}`, borderRadius: 7, cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
                          ✏️ {t(lang, "edit")}
                        </button>
                        <button onClick={() => deleteClass(cls.id, cls.name)}
                          style={{ padding: "0.4rem 0.75rem", background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca", borderRadius: 7, cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
                          🗑️ {t(lang, "delete")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: "1rem", padding: "0.85rem 1rem", background: isDark ? "#1e293b" : "#fffbeb", border: `1px solid ${isDark ? "#334155" : "#fde68a"}`, borderRadius: 10, fontSize: "0.82rem", color: isDark ? "#fbbf24" : "#92400e" }}>
            💡 {t(lang, "tinkercad_assign_hint")}
          </div>
        </>
      )}
    </div>
  );
}
