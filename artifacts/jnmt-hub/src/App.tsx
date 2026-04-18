import { lazy, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AppProvider, useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import LoginPage from "@/pages/LoginPage";
import { getToken } from "@/lib/auth";

// Always-loaded (core pages, small)
import HomePage from "@/pages/HomePage";
import ChatPage from "@/pages/ChatPage";

// Lazy-loaded (split into separate chunks)
const DictionaryPage    = lazy(() => import("@/pages/DictionaryPage"));
const SchedulePage      = lazy(() => import("@/pages/SchedulePage"));
const MapPage           = lazy(() => import("@/pages/MapPage"));
const SubtitlePage      = lazy(() => import("@/pages/SubtitlePage"));
const ConversationPage  = lazy(() => import("@/pages/ConversationPage"));
const VocabPage         = lazy(() => import("@/pages/VocabPage"));
const TimerPage         = lazy(() => import("@/pages/TimerPage"));
const DdayPage          = lazy(() => import("@/pages/DdayPage"));
const MenuPage          = lazy(() => import("@/pages/MenuPage"));
const TransportPage     = lazy(() => import("@/pages/TransportPage"));
const HealthPage        = lazy(() => import("@/pages/HealthPage"));
const AIChatPage        = lazy(() => import("@/pages/AIChatPage"));
const TinkercadPage     = lazy(() => import("@/pages/TinkercadPage"));
const WeatherPage       = lazy(() => import("@/pages/WeatherPage"));
const CurrencyPage      = lazy(() => import("@/pages/CurrencyPage"));
const GPAPage           = lazy(() => import("@/pages/GPAPage"));
const KoreanWordPage    = lazy(() => import("@/pages/KoreanWordPage"));
const QRCodePage        = lazy(() => import("@/pages/QRCodePage"));
const TimezonePage      = lazy(() => import("@/pages/TimezonePage"));
const AnnouncementsPage = lazy(() => import("@/pages/AnnouncementsPage"));
const LinksPage         = lazy(() => import("@/pages/LinksPage"));
const AdminPage         = lazy(() => import("@/pages/AdminPage"));
const NotesPage         = lazy(() => import("@/pages/NotesPage"));
const ProfilePage       = lazy(() => import("@/pages/ProfilePage"));
const AboutPage         = lazy(() => import("@/pages/AboutPage"));
const CalculatorPage    = lazy(() => import("@/pages/CalculatorPage"));
const ExpensePage       = lazy(() => import("@/pages/ExpensePage"));
const KoreanKeyboardPage = lazy(() => import("@/pages/KoreanKeyboardPage"));
const StudySoundsPage   = lazy(() => import("@/pages/StudySoundsPage"));

setAuthTokenGetter(() => getToken());

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30 * 1000 },
  },
});

function PageLoader() {
  const { isDark, lang } = useApp();
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "4rem 1rem", color: isDark ? "#94a3b8" : "#64748b", fontSize: "0.9rem", gap: "0.5rem" }}>
      <span style={{ display: "inline-block", width: 18, height: 18, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      {t(lang, "loading")}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function CurrentPage({ page }: { page: string }) {
  switch (page) {
    case "home":          return <HomePage />;
    case "chat":          return <ChatPage />;
    case "dictionary":    return <DictionaryPage />;
    case "schedule":      return <SchedulePage />;
    case "map":           return <MapPage />;
    case "subtitle":      return <SubtitlePage />;
    case "conversation":  return <ConversationPage />;
    case "vocab":         return <VocabPage />;
    case "timer":         return <TimerPage />;
    case "dday":          return <DdayPage />;
    case "menu":          return <MenuPage />;
    case "transport":     return <TransportPage />;
    case "health":        return <HealthPage />;
    case "ai":            return <AIChatPage />;
    case "tinkercad":     return <TinkercadPage />;
    case "weather":       return <WeatherPage />;
    case "currency":      return <CurrencyPage />;
    case "gpa":           return <GPAPage />;
    case "koreanword":    return <KoreanWordPage />;
    case "qrcode":        return <QRCodePage />;
    case "timezone":      return <TimezonePage />;
    case "announcements": return <AnnouncementsPage />;
    case "links":         return <LinksPage />;
    case "admin":         return <AdminPage />;
    case "notes":         return <NotesPage />;
    case "profile":       return <ProfilePage />;
    case "about":         return <AboutPage />;
    case "calculator":    return <CalculatorPage />;
    case "expense":       return <ExpensePage />;
    case "koreankey":     return <KoreanKeyboardPage />;
    case "studysounds":   return <StudySoundsPage />;
    default:              return <HomePage />;
  }
}

const springTransition = {
  type: "spring" as const,
  stiffness: 420,
  damping: 36,
  mass: 0.9,
};

function AppContent() {
  const { activePage, currentUser } = useApp();

  if (!currentUser) return <LoginPage />;

  return (
    <div style={{ minHeight: "100vh", color: "var(--text)" }}>
      <Navbar />
      <main style={{ paddingBottom: "env(safe-area-inset-bottom)" }} className="main-content">
        <style>{`@media (max-width: 639px) { .main-content { padding-bottom: 64px !important; } }`}</style>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 20, scale: 0.985 }}
            animate={{ opacity: 1, y: 0,  scale: 1     }}
            exit={{    opacity: 0, y: -12, scale: 0.99  }}
            transition={springTransition}
            style={{ willChange: "transform, opacity" }}
          >
            <Suspense fallback={<PageLoader />}>
              <CurrentPage page={activePage} />
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </QueryClientProvider>
  );
}
