import { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from "react";
import { LangCode, t, loadLang } from "@/lib/i18n";
import { User, getStoredUser, setStoredUser, getToken, setToken, removeToken } from "@/lib/auth";
import Toast, { ToastType } from "@/components/Toast";

interface ToastState { message: string; type: ToastType; id: number }

interface AppContextType {
  lang: LangCode;
  setLang: (lang: LangCode) => void;
  isDark: boolean;
  toggleDark: () => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  currentUser: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  activePage: string;
  setActivePage: (page: string) => void;
  showToast: (message: string, type?: ToastType) => void;
  chatUnread: number;
  resetChatUnread: () => void;
  sendWsMessage: (data: unknown) => void;
  onlineUsers: string[];
  updateUser: (user: User) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(() => {
    return (localStorage.getItem("jnmt_lang") as LangCode) || "vi";
  });
  const [langReady, setLangReady] = useState(() => {
    // vi is pre-loaded synchronously, others need async load
    const stored = (localStorage.getItem("jnmt_lang") as LangCode) || "vi";
    return stored === "vi";
  });
  const [accentColor, setAccentColorState] = useState(() => localStorage.getItem("jnmt_accent") || "#2563eb");

  const setAccentColor = useCallback((color: string) => {
    setAccentColorState(color);
    localStorage.setItem("jnmt_accent", color);
    document.documentElement.style.setProperty("--primary", color);
  }, []);

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("jnmt_theme");
    if (saved) return saved === "dark";
    // Auto: dark 20:00–06:59, light otherwise
    const h = new Date().getHours();
    return h >= 20 || h < 7;
  });
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredUser());
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [activePage, setActivePage] = useState("home");
  const [toast, setToast] = useState<ToastState | null>(null);
  const [chatUnread, setChatUnread] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const activePageRef = useRef(activePage);
  const wsRef = useRef<WebSocket | null>(null);
  const currentUserRef = useRef(currentUser);

  // Load initial non-vi language bundle before first render
  useEffect(() => {
    if (!langReady) {
      loadLang(lang).then(() => setLangReady(true));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { activePageRef.current = activePage; }, [activePage]);
  useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const resetChatUnread = useCallback(() => setChatUnread(0), []);

  const updateUser = useCallback((user: User) => {
    setCurrentUser(user);
    setStoredUser(user);
    // Notify chat to refresh avatar colors
    window.dispatchEvent(new CustomEvent("user:updated", { detail: user }));
  }, []);

  const sendWsMessage = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  // Global WebSocket for chat realtime + unread badge
  useEffect(() => {
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    const connect = () => {
      const ws = new WebSocket(`${proto}//${window.location.host}/ws/room/chat`);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "online_users") {
            setOnlineUsers(data.users || []);
          } else if (data.type === "new_message") {
            window.dispatchEvent(new CustomEvent("chat:new_message", { detail: data.message }));
            if (activePageRef.current !== "chat") {
              setChatUnread((n) => n + 1);
            }
          } else if (data.type === "delete_message") {
            window.dispatchEvent(new CustomEvent("chat:delete_message", { detail: { messageId: data.messageId } }));
          } else if (data.type === "edit_message") {
            window.dispatchEvent(new CustomEvent("chat:edit_message", { detail: data }));
          } else if (data.type === "reaction_update") {
            window.dispatchEvent(new CustomEvent("chat:reaction_update", { detail: data }));
          } else if (data.type === "typing") {
            window.dispatchEvent(new CustomEvent("chat:typing", { detail: { username: data.username } }));
          }
        } catch { /* ignore */ }
      };

      ws.onopen = () => {
        if (currentUserRef.current) {
          ws.send(JSON.stringify({ type: "join", username: currentUserRef.current.username }));
        }
      };

      ws.onclose = () => {
        setTimeout(connect, 3000);
      };
    };
    connect();
    return () => {
      wsRef.current?.close();
    };
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, [isDark]);

  function setLang(l: LangCode) {
    loadLang(l).then(() => {
      setLangState(l);
      localStorage.setItem("jnmt_lang", l);
    });
  }

  function toggleDark() {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem("jnmt_theme", next ? "dark" : "light");
      return next;
    });
  }

  function login(user: User, authToken: string) {
    setCurrentUser(user);
    setTokenState(authToken);
    setStoredUser(user);
    setToken(authToken);
  }

  function logout() {
    setCurrentUser(null);
    setTokenState(null);
    removeToken();
    showToast(t(lang, "logout_success"), "success");
  }

  if (!langReady) return null;

  return (
    <AppContext.Provider
      value={{ lang, setLang, isDark, toggleDark, accentColor, setAccentColor, currentUser, token, login, logout, activePage, setActivePage, showToast, chatUnread, resetChatUnread, sendWsMessage, onlineUsers, updateUser }}
    >
      {children}
      {toast && (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
