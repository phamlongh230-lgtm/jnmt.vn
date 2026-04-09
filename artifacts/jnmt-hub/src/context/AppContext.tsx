import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { LangCode } from "@/lib/i18n";
import { User, getStoredUser, setStoredUser, getToken, setToken, removeToken } from "@/lib/auth";

interface AppContextType {
  lang: LangCode;
  setLang: (lang: LangCode) => void;
  isDark: boolean;
  toggleDark: () => void;
  currentUser: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  activePage: string;
  setActivePage: (page: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(() => {
    return (localStorage.getItem("jnmt_lang") as LangCode) || "vi";
  });
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("jnmt_theme") === "dark";
  });
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredUser());
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [activePage, setActivePage] = useState("home");

  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, [isDark]);

  function setLang(l: LangCode) {
    setLangState(l);
    localStorage.setItem("jnmt_lang", l);
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
  }

  return (
    <AppContext.Provider
      value={{ lang, setLang, isDark, toggleDark, currentUser, token, login, logout, activePage, setActivePage }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
