import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { getToken } from "@/lib/auth";

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  avatarColor: string;
  createdAt: string;
  lastLogin: string | null;
}

const ROLE_COLORS: Record<string, string> = { admin: "#7c3aed", moderator: "#2563eb", user: "#64748b" };
const ROLE_LABELS: Record<string, string> = { admin: "Admin", moderator: "Mod", user: "User" };

export default function AdminPage() {
  const { isDark, currentUser, showToast } = useApp();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const cardBg = isDark ? "#1e293b" : "white";
  const border = isDark ? "#334155" : "#e2e8f0";
  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const text2 = isDark ? "#94a3b8" : "#64748b";
  const inputBg = isDark ? "#0f172a" : "#f8fafc";

  if (currentUser?.role !== "admin") return (
    <div style={{ textAlign: "center", padding: "4rem 1rem", color: text2 }}>
      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
      <p style={{ fontWeight: 700 }}>Chỉ Admin mới có quyền truy cập</p>
    </div>
  );

  const load = () => {
    fetch("/api/admin/users", { headers: { Authorization: `Bearer ${getToken()}` } })
      .then((r) => r.json()).then((d) => { setUsers(Array.isArray(d) ? d : []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const update = async (id: number, field: "role" | "isActive", value: string | boolean) => {
    setSaving(id);
    try {
      const r = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ [field]: value }),
      });
      if (r.ok) {
        setUsers((prev) => prev.map((u) => u.id === id ? { ...u, [field]: value } : u));
        showToast("Đã cập nhật!", "success");
      } else {
        const e = await r.json();
        showToast(e.error || "Lỗi!", "error");
      }
    } finally { setSaving(null); }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return !q || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString("vi-VN") : "—";

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem 1rem" }} className="animate-fade-in">
      <div style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)", borderRadius: 16, padding: "1.5rem", color: "white", marginBottom: "1.25rem" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 900, margin: 0, marginBottom: "0.25rem" }}>⚙️ Quản lý người dùng</h1>
        <p style={{ margin: 0, opacity: 0.85, fontSize: "0.85rem" }}>{users.length} tài khoản · {users.filter((u) => u.isActive).length} hoạt động</p>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Tìm theo tên hoặc email..." style={{ width: "100%", padding: "0.7rem 1rem", border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: textCol, fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }} />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", color: text2, padding: "3rem" }}>Đang tải...</div>
      ) : (
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 12, overflow: "hidden" }}>
          {filtered.map((user, i) => (
            <div key={user.id} style={{ padding: "0.9rem 1rem", borderBottom: i < filtered.length - 1 ? `1px solid ${border}` : undefined, display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              {/* Avatar */}
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: user.avatarColor || "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "0.9rem", flexShrink: 0 }}>
                {user.username.charAt(0).toUpperCase()}
              </div>
              {/* Info */}
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span style={{ fontWeight: 700, color: textCol, fontSize: "0.9rem" }}>{user.username}</span>
                  <span style={{ fontSize: "0.65rem", background: ROLE_COLORS[user.role] + "20", color: ROLE_COLORS[user.role], padding: "0.1rem 0.4rem", borderRadius: 4, fontWeight: 700 }}>{ROLE_LABELS[user.role]}</span>
                  {!user.isActive && <span style={{ fontSize: "0.65rem", background: "#fef2f2", color: "#ef4444", padding: "0.1rem 0.4rem", borderRadius: 4, fontWeight: 700 }}>BAN</span>}
                </div>
                <div style={{ fontSize: "0.72rem", color: text2 }}>{user.email}</div>
                <div style={{ fontSize: "0.68rem", color: text2 }}>Tham gia: {formatDate(user.createdAt)} · Login: {formatDate(user.lastLogin)}</div>
              </div>
              {/* Controls */}
              {user.id !== currentUser?.id && (
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexShrink: 0 }}>
                  <select
                    value={user.role}
                    onChange={(e) => update(user.id, "role", e.target.value)}
                    disabled={saving === user.id}
                    style={{ padding: "0.4rem 0.5rem", border: `1px solid ${border}`, borderRadius: 6, background: inputBg, color: textCol, fontSize: "0.8rem", cursor: "pointer" }}
                  >
                    <option value="user">User</option>
                    <option value="moderator">Mod</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    onClick={() => update(user.id, "isActive", !user.isActive)}
                    disabled={saving === user.id}
                    style={{ padding: "0.4rem 0.75rem", background: user.isActive ? "#fef2f2" : "#f0fdf4", color: user.isActive ? "#ef4444" : "#16a34a", border: `1px solid ${user.isActive ? "#fecaca" : "#bbf7d0"}`, borderRadius: 6, cursor: "pointer", fontSize: "0.8rem", fontWeight: 700 }}
                  >
                    {saving === user.id ? "..." : user.isActive ? "Ban" : "Unban"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
