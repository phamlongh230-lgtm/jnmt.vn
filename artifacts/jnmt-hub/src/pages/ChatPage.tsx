import { useState, useEffect, useRef, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";
import { useGetMessages, useCreateMessage, getGetMessagesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ChatSkeleton } from "@/components/Skeleton";
import { getToken } from "@/lib/auth";
import GifPicker from "@/components/GifPicker";
import EmojiPicker from "@/components/EmojiPicker";

interface MessageItem {
  id: number;
  content: string;
  username: string;
  userId: number;
  createdAt: string;
}

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

export default function ChatPage() {
  const { lang, currentUser, token, isDark, showToast, resetChatUnread, sendWsMessage } = useApp();
  const [messageText, setMessageText] = useState("");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showGif, setShowGif] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const typingSentAt = useRef(0);
  const queryClient = useQueryClient();

  const isMod = currentUser?.role === "moderator" || currentUser?.role === "admin";

  // Reset unread badge when visiting chat page
  useEffect(() => {
    resetChatUnread();
  }, [resetChatUnread]);

  // WebSocket: realtime new messages, deletes, typing
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
      // Only ping for other people's messages
      if (msg.userId !== currentUser?.id) playPing();
    };

    const handleDelete = (e: Event) => {
      const { messageId } = (e as CustomEvent<{ messageId: number }>).detail;
      queryClient.setQueryData(
        getGetMessagesQueryKey({ limit: 100 }),
        (old: MessageItem[] | undefined) => old ? old.filter((m) => m.id !== messageId) : old
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

    window.addEventListener("chat:new_message", handleNew);
    window.addEventListener("chat:delete_message", handleDelete);
    window.addEventListener("chat:typing", handleTyping);
    return () => {
      window.removeEventListener("chat:new_message", handleNew);
      window.removeEventListener("chat:delete_message", handleDelete);
      window.removeEventListener("chat:typing", handleTyping);
    };
  }, [currentUser, queryClient]);

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
        if (textareaRef.current) { textareaRef.current.style.height = "auto"; }
        // Optimistically add to cache (WS will dedup)
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
        setError(e?.data?.error || "Không thể gửi tin nhắn!");
      },
    },
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Track scroll position for scroll-to-bottom button
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
    createMessageMutation.mutate({ data: { content: text } });
  }, [messageText, currentUser, token, lang, createMessageMutation]);

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
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);
    // Auto-resize
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
    // Send typing event (throttle: max 1 per 2s)
    const now = Date.now();
    if (currentUser && now - typingSentAt.current > 2000) {
      typingSentAt.current = now;
      sendWsMessage({ type: "typing", username: currentUser.username });
    }
  };

  const handleDelete = async (messageId: number) => {
    if (!confirm("Xóa tin nhắn này?")) return;
    setDeletingId(messageId);
    try {
      await fetch(`/api/messages/${messageId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      showToast("Đã xóa tin nhắn!", "success");
    } catch {
      showToast("Không thể xóa tin nhắn!", "error");
    } finally {
      setDeletingId(null);
    }
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

  const getColor = (username: string) => {
    const colors = ["#2563eb", "#7c3aed", "#0891b2", "#059669", "#d97706", "#dc2626"];
    let hash = 0;
    for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + hash * 31;
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem 1rem", display: "flex", flexDirection: "column", height: "calc(100vh - 100px)" }} className="animate-fade-in">
      <style>{`
        .delete-btn { opacity: 0; transition: opacity 0.15s; }
        .msg-wrap:hover .delete-btn { opacity: 1 !important; }
        .gif-btn:hover, .emoji-btn:hover { background: ${isDark ? "#334155" : "#e2e8f0"} !important; }
      `}</style>

      <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 16, display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", position: "relative" }}>
        {/* Header */}
        <div style={{ padding: "1rem 1.25rem", borderBottom: `1px solid ${border}` }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#2563eb" }}>💬 {t(lang, "chat")} Cộng đồng</h2>
          <p style={{ color: text2, fontSize: "0.8rem", marginTop: 2 }}>
            {isLoading ? t(lang, "loading") : `${messages?.length || 0} tin nhắn`}
          </p>
        </div>

        {/* Messages */}
        <div ref={listRef} onScroll={handleScroll} style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
          {isLoading ? (
            <ChatSkeleton />
          ) : messages && messages.length > 0 ? (
            (messages as MessageItem[]).map((msg) => {
              const isOwn = currentUser && msg.userId === currentUser.id;
              const canDelete = isOwn || isMod;
              const color = getColor(msg.username);
              const isGif = isGifUrl(msg.content);
              return (
                <div key={msg.id} className="msg-wrap" style={{ display: "flex", flexDirection: isOwn ? "row-reverse" : "row", gap: "0.5rem", alignItems: "flex-end" }}>
                  {!isOwn && (
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "0.85rem", flexShrink: 0 }}>
                      {msg.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div style={{ maxWidth: "70%" }}>
                    {!isOwn && (
                      <div style={{ fontSize: "0.72rem", color: text2, marginBottom: "0.15rem", fontWeight: 600 }}>{msg.username}</div>
                    )}
                    <div style={{ position: "relative" }}>
                      {isGif ? (
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
                          {msg.content}
                        </div>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(msg.id)}
                          disabled={deletingId === msg.id}
                          className="delete-btn"
                          title="Xóa tin nhắn"
                          style={{
                            position: "absolute", top: -6,
                            right: isOwn ? "auto" : -6, left: isOwn ? -6 : "auto",
                            width: 18, height: 18, borderRadius: "50%",
                            background: "#ef4444", border: "none", color: "white",
                            fontSize: "0.6rem", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            opacity: deletingId === msg.id ? 0.5 : 0,
                          }}
                        >✕</button>
                      )}
                    </div>
                    <div
                      title={formatFull(msg.createdAt)}
                      style={{ fontSize: "0.7rem", color: text2, marginTop: "0.15rem", textAlign: isOwn ? "right" : "left", cursor: "default" }}
                    >
                      {formatTime(msg.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: "center", color: text2, padding: "3rem" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>💬</div>
              <p style={{ fontWeight: 600 }}>Chưa có tin nhắn nào</p>
              <p style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>Hãy là người đầu tiên nhắn!</p>
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
                {typingUsers.join(", ")} đang nhập...
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
            title="Xuống cuối"
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
              {error && (
                <div style={{ background: isDark ? "#450a0a" : "#fef2f2", color: "#ef4444", padding: "0.5rem 0.75rem", borderRadius: 8, marginBottom: "0.5rem", fontSize: "0.85rem", border: `1px solid ${isDark ? "#7f1d1d" : "#fecaca"}` }}>
                  ❌ {error}
                </div>
              )}
              <div style={{ display: "flex", gap: "0.6rem", alignItems: "flex-end", position: "relative" }}>
                {showGif && <GifPicker onSelect={sendGif} onClose={() => setShowGif(false)} />}
                {showEmoji && <EmojiPicker onSelect={insertEmoji} onClose={() => setShowEmoji(false)} />}

                {/* Emoji button */}
                <button
                  className="emoji-btn"
                  onClick={() => { setShowEmoji((v) => !v); setShowGif(false); }}
                  title="Emoji"
                  style={{
                    padding: "0.65rem 0.7rem", background: showEmoji ? (isDark ? "#334155" : "#e2e8f0") : "transparent",
                    border: `1px solid ${border}`, borderRadius: 10, cursor: "pointer",
                    fontSize: "1.05rem", flexShrink: 0,
                  }}
                >😊</button>

                {/* GIF button */}
                <button
                  className="gif-btn"
                  onClick={() => { setShowGif((v) => !v); setShowEmoji(false); }}
                  title="GIF"
                  style={{
                    padding: "0.65rem 0.6rem", background: showGif ? (isDark ? "#334155" : "#e2e8f0") : "transparent",
                    border: `1px solid ${border}`, borderRadius: 10, cursor: "pointer",
                    fontSize: "0.75rem", fontWeight: 800, color: text2, flexShrink: 0,
                  }}
                >GIF</button>

                <textarea
                  ref={textareaRef}
                  value={messageText}
                  onChange={handleTextChange}
                  onKeyDown={handleKeyDown}
                  placeholder={t(lang, "message_placeholder")}
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
    </div>
  );
}
