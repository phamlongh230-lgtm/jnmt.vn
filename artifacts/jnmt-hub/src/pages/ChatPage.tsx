import { useState, useEffect, useRef, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";
import { useGetMessages, useCreateMessage, getGetMessagesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ChatSkeleton } from "@/components/Skeleton";
import { getToken } from "@/lib/auth";
import GifPicker from "@/components/GifPicker";
import EmojiPicker from "@/components/EmojiPicker";

const REACTION_EMOJIS = ["❤️", "👍", "😂", "😮", "😢", "😡"];

interface Reaction {
  count: number;
  hasMe: boolean;
}

interface MessageItem {
  id: number;
  content: string;
  username: string;
  userId: number;
  createdAt: string;
  userRole?: string;
  avatarColor?: string;
  replyToId?: number | null;
  replyToContent?: string | null;
  replyToUsername?: string | null;
  editedAt?: string | null;
  reactions?: Record<string, Reaction>;
}

const ROLE_BADGE: Record<string, { label: string; color: string }> = {
  admin: { label: "Admin", color: "#7c3aed" },
  moderator: { label: "Mod", color: "#2563eb" },
};

function playPing() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  } catch { /* AudioContext blocked */ }
}

function renderContent(content: string, textCol: string, isDark: boolean) {
  // Highlight @mentions
  const parts = content.split(/(@\w+)/g);
  return parts.map((part, i) =>
    /^@\w+$/.test(part)
      ? <span key={i} style={{ color: "#2563eb", fontWeight: 700, background: isDark ? "#1e3a5f" : "#dbeafe", borderRadius: 3, padding: "0 2px" }}>{part}</span>
      : <span key={i}>{part}</span>
  );
}

export default function ChatPage() {
  const { lang, currentUser, token, isDark, showToast, resetChatUnread, sendWsMessage, onlineUsers } = useApp();
  const [messageText, setMessageText] = useState("");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showGif, setShowGif] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [replyTo, setReplyTo] = useState<MessageItem | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [reactionPickerFor, setReactionPickerFor] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const typingSentAt = useRef(0);
  const queryClient = useQueryClient();

  const isMod = currentUser?.role === "moderator" || currentUser?.role === "admin";

  useEffect(() => {
    resetChatUnread();
  }, [resetChatUnread]);

  // Request notification permission once
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // WebSocket: realtime messages, deletes, edits, reactions, typing
  useEffect(() => {
    const handleNew = (e: Event) => {
      const msg = (e as CustomEvent<MessageItem>).detail;
      queryClient.setQueryData(
        getGetMessagesQueryKey({ limit: 100 }),
        (old: MessageItem[] | undefined) => {
          if (!old) return [msg];
          if (old.some((m) => m.id === msg.id)) return old;
          return [...old, msg];
        }
      );
      if (msg.userId !== currentUser?.id) {
        playPing();
        // Browser notification on @mention
        if (
          currentUser?.username &&
          msg.content.toLowerCase().includes(`@${currentUser.username.toLowerCase()}`) &&
          "Notification" in window && Notification.permission === "granted" &&
          document.visibilityState === "hidden"
        ) {
          new Notification(`${msg.username} nhắc đến bạn`, {
            body: msg.content.slice(0, 100),
            icon: "/favicon.svg",
            tag: `mention-${msg.id}`,
          });
        }
      }
    };

    const handleDelete = (e: Event) => {
      const { messageId } = (e as CustomEvent<{ messageId: number }>).detail;
      queryClient.setQueryData(
        getGetMessagesQueryKey({ limit: 100 }),
        (old: MessageItem[] | undefined) => old ? old.filter((m) => m.id !== messageId) : old
      );
    };

    const handleEdit = (e: Event) => {
      const { messageId, content, editedAt } = (e as CustomEvent<{ messageId: number; content: string; editedAt: string }>).detail;
      queryClient.setQueryData(
        getGetMessagesQueryKey({ limit: 100 }),
        (old: MessageItem[] | undefined) => old ? old.map((m) => m.id === messageId ? { ...m, content, editedAt } : m) : old
      );
    };

    const handleReaction = (e: Event) => {
      const { messageId, reactions } = (e as CustomEvent<{ messageId: number; reactions: Record<string, Reaction> }>).detail;
      queryClient.setQueryData(
        getGetMessagesQueryKey({ limit: 100 }),
        (old: MessageItem[] | undefined) => old ? old.map((m) => m.id === messageId ? { ...m, reactions } : m) : old
      );
    };

    const handleTyping = (e: Event) => {
      const { username } = (e as CustomEvent<{ username: string }>).detail;
      if (username === currentUser?.username) return;
      setTypingUsers((prev) => prev.includes(username) ? prev : [...prev, username]);
      const existing = typingTimers.current.get(username);
      if (existing) clearTimeout(existing);
      const timer = setTimeout(() => {
        setTypingUsers((prev) => prev.filter((u) => u !== username));
        typingTimers.current.delete(username);
      }, 3000);
      typingTimers.current.set(username, timer);
    };

    const handleAvatarUpdate = (e: Event) => {
      const user = (e as CustomEvent<{ id: number; avatarColor?: string }>).detail;
      queryClient.setQueryData(
        getGetMessagesQueryKey({ limit: 100 }),
        (old: MessageItem[] | undefined) =>
          old ? old.map((m) => m.userId === user.id ? { ...m, avatarColor: user.avatarColor } : m) : old
      );
    };

    window.addEventListener("chat:new_message", handleNew);
    window.addEventListener("chat:delete_message", handleDelete);
    window.addEventListener("chat:edit_message", handleEdit);
    window.addEventListener("chat:reaction_update", handleReaction);
    window.addEventListener("chat:typing", handleTyping);
    window.addEventListener("user:updated", handleAvatarUpdate);
    return () => {
      window.removeEventListener("chat:new_message", handleNew);
      window.removeEventListener("chat:delete_message", handleDelete);
      window.removeEventListener("chat:edit_message", handleEdit);
      window.removeEventListener("chat:reaction_update", handleReaction);
      window.removeEventListener("chat:typing", handleTyping);
      window.removeEventListener("user:updated", handleAvatarUpdate);
    };
  }, [currentUser, queryClient]);

  // Close reaction picker on outside click
  useEffect(() => {
    if (!reactionPickerFor) return;
    const handler = () => setReactionPickerFor(null);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [reactionPickerFor]);

  const border = isDark ? "#334155" : "#e2e8f0";
  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const text2 = isDark ? "#94a3b8" : "#64748b";
  const cardBg = isDark ? "#1e293b" : "white";
  const inputBg = isDark ? "#0f172a" : "#f8fafc";

  const { data: messages, isLoading } = useGetMessages(
    { limit: 100 },
    { query: { queryKey: getGetMessagesQueryKey({ limit: 100 }) } }
  );

  const createMessageMutation = useCreateMessage({
    mutation: {
      onSuccess: (data) => {
        setMessageText("");
        setError("");
        setReplyTo(null);
        if (textareaRef.current) { textareaRef.current.style.height = "auto"; }
        queryClient.setQueryData(
          getGetMessagesQueryKey({ limit: 100 }),
          (old: MessageItem[] | undefined) => {
            if (!old) return [data as MessageItem];
            if (old.some((m) => m.id === (data as MessageItem).id)) return old;
            return [...old, data as MessageItem];
          }
        );
      },
      onError: (err: unknown) => {
        const e = err as { data?: { error?: string } };
        setError(e?.data?.error || t(lang, "error_send_message"));
      },
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distFromBottom > 200);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = useCallback(() => {
    const text = messageText.trim();
    if (!text) return;
    if (!currentUser || !token) { setError(t(lang, "must_login_to_chat")); return; }
    const body: Record<string, unknown> = { content: text };
    if (replyTo) {
      body.replyToId = replyTo.id;
    }
    createMessageMutation.mutate({ data: body as { content: string } });
  }, [messageText, currentUser, token, lang, replyTo, createMessageMutation]);

  const sendGif = (url: string) => {
    if (!currentUser || !token) return;
    createMessageMutation.mutate({ data: { content: url } });
  };

  const insertEmoji = (emoji: string) => {
    setMessageText((prev) => prev + emoji);
    setShowEmoji(false);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
    if (e.key === "Escape") { setReplyTo(null); setShowGif(false); setShowEmoji(false); }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
    const now = Date.now();
    if (currentUser && now - typingSentAt.current > 2000) {
      typingSentAt.current = now;
      sendWsMessage({ type: "typing", username: currentUser.username });
    }
  };

  const handleDelete = async (messageId: number) => {
    if (!confirm(t(lang, "confirm_delete"))) return;
    setDeletingId(messageId);
    try {
      await fetch(`/api/messages/${messageId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      showToast(t(lang, "deleted_ok"), "success");
    } catch {
      showToast(t(lang, "error_delete_message"), "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = async (messageId: number) => {
    const text = editText.trim();
    if (!text) return;
    try {
      const r = await fetch(`/api/messages/${messageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ content: text }),
      });
      if (r.ok) {
        showToast(t(lang, "edited_ok"), "success");
        setEditingId(null);
      } else {
        const e = await r.json();
        showToast(e.error || t(lang, "error_edit_message"), "error");
      }
    } catch {
      showToast(t(lang, "connection_error"), "error");
    }
  };

  const handleReaction = async (messageId: number, emoji: string) => {
    if (!currentUser || !token) return;
    setReactionPickerFor(null);
    await fetch(`/api/messages/${messageId}/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ emoji }),
    });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  const formatFull = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("vi-VN");
  };

  const isGifUrl = (content: string) => {
    try {
      const url = new URL(content.trim());
      return (url.hostname.includes("tenor.com") || url.hostname.includes("giphy.com") || content.trim().endsWith(".gif")) && url.protocol === "https:";
    } catch { return false; }
  };

  const getColor = (username: string, avatarColor?: string) => {
    if (avatarColor) return avatarColor;
    const colors = ["#2563eb", "#7c3aed", "#0891b2", "#059669", "#d97706", "#dc2626"];
    let hash = 0;
    for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + hash * 31;
    return colors[Math.abs(hash) % colors.length];
  };

  const filteredMessages = (messages as MessageItem[] | undefined)?.filter((m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return m.content.toLowerCase().includes(q) || m.username.toLowerCase().includes(q);
  });

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem 1rem", display: "flex", flexDirection: "column", height: "calc(100vh - 100px)" }} className="animate-fade-in">
      <style>{`
        .delete-btn { opacity: 0; transition: opacity 0.15s; }
        .msg-wrap:hover .delete-btn { opacity: 1 !important; }
        .msg-wrap:hover .reaction-btn { opacity: 1 !important; }
        .reaction-btn { opacity: 0; transition: opacity 0.15s; }
        .gif-btn:hover, .emoji-btn:hover { background: ${isDark ? "#334155" : "#e2e8f0"} !important; }
      `}</style>

      <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 16, display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", position: "relative" }}>
        {/* Header */}
        <div style={{ padding: "0.85rem 1.25rem", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
          <div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#2563eb", margin: 0 }}>💬 {t(lang, "chat")} {t(lang, "tool_group_community")}</h2>
            <p style={{ color: text2, fontSize: "0.78rem", marginTop: 2, margin: 0 }}>
              {isLoading ? t(lang, "loading") : `${messages?.length || 0} ${t(lang, "messages_suffix")}`}
              {onlineUsers.length > 0 && (
                <span style={{ marginLeft: "0.5rem" }}>
                  · <span style={{ color: "#22c55e", fontWeight: 600 }}>● {onlineUsers.length} {t(lang, "online_count")}</span>
                </span>
              )}
            </p>
          </div>
          <button onClick={() => setShowSearch((v) => !v)} style={{ background: showSearch ? (isDark ? "#1e40af22" : "#eff6ff") : "none", border: `1px solid ${showSearch ? "#2563eb" : border}`, borderRadius: 8, padding: "0.4rem 0.75rem", color: showSearch ? "#2563eb" : text2, cursor: "pointer", fontSize: "0.85rem" }}>
            🔍
          </button>
        </div>

        {/* Search bar */}
        {showSearch && (
          <div style={{ padding: "0.6rem 1rem", borderBottom: `1px solid ${border}` }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t(lang, "search_messages_ph")}
              autoFocus
              style={{ width: "100%", padding: "0.5rem 0.75rem", border: `1px solid ${border}`, borderRadius: 8, background: inputBg, color: textCol, fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }}
            />
          </div>
        )}

        {/* Messages */}
        <div ref={listRef} onScroll={handleScroll} style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
          {isLoading ? (
            <ChatSkeleton />
          ) : filteredMessages && filteredMessages.length > 0 ? (
            filteredMessages.map((msg) => {
              const isOwn = currentUser && msg.userId === currentUser.id;
              const canDelete = isOwn || isMod;
              const canEdit = isOwn && !msg.editedAt;
              const color = getColor(msg.username, msg.avatarColor);
              const isGif = isGifUrl(msg.content);
              const badge = ROLE_BADGE[msg.userRole || ""];
              const isEditing = editingId === msg.id;
              const totalReactions = Object.values(msg.reactions || {}).reduce((a, r) => a + r.count, 0);

              return (
                <div key={msg.id} className="msg-wrap" style={{ display: "flex", flexDirection: isOwn ? "row-reverse" : "row", gap: "0.5rem", alignItems: "flex-end" }}>
                  {!isOwn && (
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "0.85rem", flexShrink: 0, alignSelf: "flex-start", marginTop: "1.1rem" }}>
                      {msg.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div style={{ maxWidth: "70%" }}>
                    {!isOwn && (
                      <div style={{ fontSize: "0.72rem", color: text2, marginBottom: "0.15rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        {msg.username}
                        {badge && (
                          <span style={{ fontSize: "0.58rem", background: badge.color + "20", color: badge.color, padding: "0.05rem 0.3rem", borderRadius: 3, fontWeight: 700 }}>{badge.label}</span>
                        )}
                      </div>
                    )}

                    {/* Reply quote */}
                    {msg.replyToId && msg.replyToUsername && (
                      <div style={{ background: isDark ? "#0f172a" : "#f1f5f9", border: `1px solid ${border}`, borderLeft: "3px solid #2563eb", borderRadius: 6, padding: "0.3rem 0.6rem", marginBottom: "0.25rem", fontSize: "0.75rem", color: text2, maxWidth: "100%", overflow: "hidden" }}>
                        <span style={{ fontWeight: 700, color: "#2563eb" }}>↩ {msg.replyToUsername}</span>
                        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>{msg.replyToContent}</div>
                      </div>
                    )}

                    <div style={{ position: "relative" }}>
                      {isEditing ? (
                        <div style={{ display: "flex", gap: "0.4rem", alignItems: "flex-end" }}>
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleEdit(msg.id); } if (e.key === "Escape") setEditingId(null); }}
                            autoFocus
                            rows={2}
                            style={{ flex: 1, padding: "0.5rem", border: `1px solid #2563eb`, borderRadius: 8, background: inputBg, color: textCol, fontSize: "0.88rem", resize: "none", outline: "none" }}
                          />
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                            <button onClick={() => handleEdit(msg.id)} style={{ padding: "0.3rem 0.5rem", background: "#2563eb", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: "0.75rem" }}>✓</button>
                            <button onClick={() => setEditingId(null)} style={{ padding: "0.3rem 0.5rem", background: "none", border: `1px solid ${border}`, borderRadius: 6, cursor: "pointer", fontSize: "0.75rem", color: text2 }}>✕</button>
                          </div>
                        </div>
                      ) : isGif ? (
                        <div style={{ borderRadius: isOwn ? "12px 12px 4px 12px" : "12px 12px 12px 4px", overflow: "hidden", maxWidth: 220, border: `1px solid ${border}` }}>
                          <img src={msg.content} alt="GIF" style={{ display: "block", width: "100%", maxHeight: 180, objectFit: "cover" }} loading="lazy" />
                        </div>
                      ) : (
                        <div style={{
                          background: isOwn ? "#2563eb" : isDark ? "#0f172a" : "#f8fafc",
                          color: isOwn ? "white" : textCol,
                          padding: "0.55rem 0.85rem",
                          borderRadius: isOwn ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                          fontSize: "0.9rem",
                          border: isOwn ? "none" : `1px solid ${border}`,
                          wordBreak: "break-word",
                          whiteSpace: "pre-wrap",
                        }}>
                          {renderContent(msg.content, isOwn ? "white" : textCol, isDark)}
                        </div>
                      )}

                      {/* Action buttons (hover) */}
                      {!isEditing && (
                        <div style={{ position: "absolute", top: -6, [isOwn ? "left" : "right"]: -70, display: "flex", gap: "0.2rem" }}>
                          {/* React button */}
                          {currentUser && (
                            <button
                              className="reaction-btn"
                              onClick={(e) => { e.stopPropagation(); setReactionPickerFor(reactionPickerFor === msg.id ? null : msg.id); }}
                              title={t(lang, "react_emoji")}
                              style={{ width: 22, height: 22, borderRadius: "50%", background: isDark ? "#334155" : "#e2e8f0", border: "none", cursor: "pointer", fontSize: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center" }}
                            >😊</button>
                          )}
                          {/* Reply button */}
                          {currentUser && (
                            <button
                              className="reaction-btn"
                              onClick={() => { setReplyTo(msg); textareaRef.current?.focus(); }}
                              title={t(lang, "reply_btn")}
                              style={{ width: 22, height: 22, borderRadius: "50%", background: isDark ? "#334155" : "#e2e8f0", border: "none", cursor: "pointer", fontSize: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center" }}
                            >↩</button>
                          )}
                          {/* Edit button (own, not yet edited) */}
                          {canEdit && (
                            <button
                              className="reaction-btn"
                              onClick={() => { setEditingId(msg.id); setEditText(msg.content); }}
                              title={t(lang, "edit_5min")}
                              style={{ width: 22, height: 22, borderRadius: "50%", background: isDark ? "#334155" : "#e2e8f0", border: "none", cursor: "pointer", fontSize: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center" }}
                            >✏️</button>
                          )}
                          {/* Delete button */}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(msg.id)}
                              disabled={deletingId === msg.id}
                              className="delete-btn"
                              title={t(lang, "delete_msg")}
                              style={{ width: 22, height: 22, borderRadius: "50%", background: "#ef4444", border: "none", color: "white", fontSize: "0.6rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            >✕</button>
                          )}
                        </div>
                      )}

                      {/* Reaction picker */}
                      {reactionPickerFor === msg.id && (
                        <div onClick={(e) => e.stopPropagation()} style={{ position: "absolute", [isOwn ? "right" : "left"]: 0, bottom: "calc(100% + 4px)", background: isDark ? "#1e293b" : "white", border: `1px solid ${border}`, borderRadius: 20, padding: "0.3rem 0.5rem", display: "flex", gap: "0.2rem", boxShadow: "0 4px 16px rgba(0,0,0,0.15)", zIndex: 50 }}>
                          {REACTION_EMOJIS.map((emoji) => (
                            <button key={emoji} onClick={() => handleReaction(msg.id, emoji)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", padding: "0.1rem", borderRadius: 6, transition: "transform 0.1s" }}
                              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.3)")}
                              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                            >{emoji}</button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Reactions display */}
                    {totalReactions > 0 && (
                      <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap", marginTop: "0.2rem" }}>
                        {Object.entries(msg.reactions || {}).filter(([, r]) => r.count > 0).map(([emoji, r]) => (
                          <button key={emoji} onClick={() => handleReaction(msg.id, emoji)}
                            style={{ background: r.hasMe ? (isDark ? "#1e3a5f" : "#dbeafe") : (isDark ? "#0f172a" : "#f1f5f9"), border: `1px solid ${r.hasMe ? "#2563eb" : border}`, borderRadius: 12, padding: "0.1rem 0.45rem", fontSize: "0.75rem", cursor: currentUser ? "pointer" : "default", display: "flex", alignItems: "center", gap: "0.2rem", color: textCol }}>
                            {emoji} <span style={{ fontSize: "0.7rem", fontWeight: 600 }}>{r.count}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <div
                      title={formatFull(msg.createdAt)}
                      style={{ fontSize: "0.68rem", color: text2, marginTop: "0.12rem", textAlign: isOwn ? "right" : "left", cursor: "default" }}
                    >
                      {formatTime(msg.createdAt)}
                      {msg.editedAt && <span style={{ marginLeft: "0.3rem", opacity: 0.7 }}>({t(lang, "edited_label")})</span>}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: "center", color: text2, padding: "3rem" }}>
              {search ? (
                <>
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔍</div>
                  <p>{t(lang, "no_messages_found")}</p>
                </>
              ) : (
                <>
                  <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>💬</div>
                  <p style={{ fontWeight: 600 }}>{t(lang, "no_messages_yet")}</p>
                  <p style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>{t(lang, "be_first_to_chat")}</p>
                </>
              )}
            </div>
          )}

          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.2rem 0" }}>
              <div style={{ display: "flex", gap: 3 }}>
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: text2, display: "inline-block", animation: `typing-dot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
              <span style={{ fontSize: "0.75rem", color: text2, fontStyle: "italic" }}>
                {typingUsers.join(", ")} {t(lang, "typing_suffix")}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Scroll-to-bottom button */}
        {showScrollBtn && (
          <button
            onClick={scrollToBottom}
            style={{
              position: "absolute", bottom: 90, right: 16,
              width: 36, height: 36, borderRadius: "50%",
              background: "#2563eb", color: "white", border: "none",
              boxShadow: "0 2px 8px rgba(37,99,235,0.4)",
              cursor: "pointer", fontSize: "1rem",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 10,
            }}
            title={t(lang, "scroll_down")}
          >↓</button>
        )}

        {/* Input */}
        <div style={{ padding: "0.85rem 1rem", borderTop: `1px solid ${border}` }}>
          <style>{`@keyframes typing-dot { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }`}</style>
          {!currentUser ? (
            <div style={{ textAlign: "center", color: text2, padding: "0.75rem", background: isDark ? "#0f172a" : "#f8fafc", borderRadius: 10 }}>
              🔑 {t(lang, "must_login_to_chat")}
            </div>
          ) : (
            <>
              {/* Reply preview */}
              {replyTo && (
                <div style={{ background: isDark ? "#0f172a" : "#f1f5f9", border: `1px solid ${border}`, borderLeft: "3px solid #2563eb", borderRadius: 6, padding: "0.35rem 0.75rem", marginBottom: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ fontSize: "0.78rem", color: text2, overflow: "hidden" }}>
                    <span style={{ color: "#2563eb", fontWeight: 700 }}>↩ {replyTo.username}</span>: <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{replyTo.content.slice(0, 80)}</span>
                  </div>
                  <button onClick={() => setReplyTo(null)} style={{ background: "none", border: "none", color: text2, cursor: "pointer", fontSize: "0.9rem", flexShrink: 0 }}>✕</button>
                </div>
              )}

              {error && (
                <div style={{ background: isDark ? "#450a0a" : "#fef2f2", color: "#ef4444", padding: "0.5rem 0.75rem", borderRadius: 8, marginBottom: "0.5rem", fontSize: "0.85rem", border: `1px solid ${isDark ? "#7f1d1d" : "#fecaca"}` }}>
                  ❌ {error}
                </div>
              )}
              <div style={{ display: "flex", gap: "0.6rem", alignItems: "flex-end", position: "relative" }}>
                {showGif && <GifPicker onSelect={sendGif} onClose={() => setShowGif(false)} />}
                {showEmoji && <EmojiPicker onSelect={insertEmoji} onClose={() => setShowEmoji(false)} />}

                <button
                  className="emoji-btn"
                  onClick={() => { setShowEmoji((v) => !v); setShowGif(false); }}
                  title="Emoji"
                  style={{ padding: "0.65rem 0.7rem", background: showEmoji ? (isDark ? "#334155" : "#e2e8f0") : "transparent", border: `1px solid ${border}`, borderRadius: 10, cursor: "pointer", fontSize: "1.05rem", flexShrink: 0 }}
                >😊</button>

                <button
                  className="gif-btn"
                  onClick={() => { setShowGif((v) => !v); setShowEmoji(false); }}
                  title="GIF"
                  style={{ padding: "0.65rem 0.6rem", background: showGif ? (isDark ? "#334155" : "#e2e8f0") : "transparent", border: `1px solid ${border}`, borderRadius: 10, cursor: "pointer", fontSize: "0.75rem", fontWeight: 800, color: text2, flexShrink: 0 }}
                >GIF</button>

                <textarea
                  ref={textareaRef}
                  value={messageText}
                  onChange={handleTextChange}
                  onKeyDown={handleKeyDown}
                  placeholder={replyTo ? `Trả lời ${replyTo.username}...` : t(lang, "message_placeholder")}
                  rows={1}
                  style={{ flex: 1, padding: "0.65rem 0.85rem", border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: textCol, fontSize: "0.9rem", resize: "none", outline: "none", lineHeight: 1.5, overflow: "hidden", maxHeight: 120 }}
                />
                <button
                  onClick={handleSend}
                  disabled={createMessageMutation.isPending || !messageText.trim()}
                  style={{ padding: "0.65rem 1.1rem", background: "#2563eb", color: "white", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: "0.9rem", flexShrink: 0, opacity: (createMessageMutation.isPending || !messageText.trim()) ? 0.6 : 1 }}
                >
                  {createMessageMutation.isPending ? "..." : "📤"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <div ref={bottomRef} />
    </div>
  );
}
