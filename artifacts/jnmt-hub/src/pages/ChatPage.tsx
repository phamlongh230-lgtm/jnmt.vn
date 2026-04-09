import { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";
import { useGetMessages, useCreateMessage, getGetMessagesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface MessageItem {
  id: number;
  content: string;
  username: string;
  userId: number;
  createdAt: string;
}

export default function ChatPage() {
  const { lang, currentUser, token, isDark } = useApp();
  const [messageText, setMessageText] = useState("");
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const border = isDark ? "#334155" : "#e2e8f0";
  const textCol = isDark ? "#f1f5f9" : "#0f172a";
  const text2 = isDark ? "#94a3b8" : "#64748b";
  const cardBg = isDark ? "#1e293b" : "white";
  const inputBg = isDark ? "#0f172a" : "#f8fafc";

  const { data: messages, isLoading } = useGetMessages(
    { limit: 100 },
    { query: { refetchInterval: 5000 } }
  );

  const createMessageMutation = useCreateMessage({
    mutation: {
      onSuccess: () => {
        setMessageText("");
        setError("");
        queryClient.invalidateQueries({ queryKey: getGetMessagesQueryKey() });
      },
      onError: (err: unknown) => {
        const e = err as { data?: { error?: string } };
        setError(e?.data?.error || "Không thể gửi tin nhắn!");
      },
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!messageText.trim()) return;
    if (!currentUser || !token) {
      setError(t(lang, "must_login_to_chat"));
      return;
    }
    createMessageMutation.mutate({ data: { content: messageText.trim() } });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  const getColor = (username: string) => {
    const colors = ["#2563eb", "#7c3aed", "#0891b2", "#059669", "#d97706", "#dc2626"];
    let hash = 0;
    for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + hash * 31;
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem 1rem", display: "flex", flexDirection: "column", height: "calc(100vh - 100px)" }} className="animate-fade-in">
      <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 16, display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "1rem 1.25rem", borderBottom: `1px solid ${border}` }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#2563eb" }}>💬 {t(lang, "chat")} Cộng đồng</h2>
          <p style={{ color: text2, fontSize: "0.8rem", marginTop: 2 }}>
            {isLoading ? t(lang, "loading") : `${messages?.length || 0} tin nhắn`}
          </p>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
          {isLoading ? (
            <div style={{ textAlign: "center", color: text2, padding: "2rem" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>💬</div>
              {t(lang, "loading")}
            </div>
          ) : messages && messages.length > 0 ? (
            (messages as MessageItem[]).map((msg) => {
              const isOwn = currentUser && msg.userId === currentUser.id;
              const color = getColor(msg.username);
              return (
                <div key={msg.id} style={{ display: "flex", flexDirection: isOwn ? "row-reverse" : "row", gap: "0.5rem", alignItems: "flex-end" }}>
                  {!isOwn && (
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "0.85rem", flexShrink: 0 }}>
                      {msg.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div style={{ maxWidth: "70%" }}>
                    {!isOwn && (
                      <div style={{ fontSize: "0.72rem", color: text2, marginBottom: "0.15rem", fontWeight: 600 }}>{msg.username}</div>
                    )}
                    <div style={{
                      background: isOwn ? "#2563eb" : isDark ? "#0f172a" : "#f8fafc",
                      color: isOwn ? "white" : textCol,
                      padding: "0.55rem 0.85rem",
                      borderRadius: isOwn ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                      fontSize: "0.9rem",
                      border: isOwn ? "none" : `1px solid ${border}`,
                      wordBreak: "break-word",
                    }}>
                      {msg.content}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: text2, marginTop: "0.15rem", textAlign: isOwn ? "right" : "left" }}>
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
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "0.85rem 1rem", borderTop: `1px solid ${border}` }}>
          {!currentUser ? (
            <div style={{ textAlign: "center", color: text2, padding: "0.75rem", background: isDark ? "#0f172a" : "#f8fafc", borderRadius: 10 }}>
              🔑 {t(lang, "must_login_to_chat")}
            </div>
          ) : (
            <>
              {error && (
                <div style={{ background: "#fef2f2", color: "#ef4444", padding: "0.5rem 0.75rem", borderRadius: 8, marginBottom: "0.5rem", fontSize: "0.85rem" }}>
                  ❌ {error}
                </div>
              )}
              <div style={{ display: "flex", gap: "0.6rem", alignItems: "flex-end" }}>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t(lang, "message_placeholder")}
                  rows={1}
                  style={{ flex: 1, padding: "0.65rem 0.85rem", border: `1px solid ${border}`, borderRadius: 10, background: inputBg, color: textCol, fontSize: "0.9rem", resize: "none", outline: "none", lineHeight: 1.5 }}
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
