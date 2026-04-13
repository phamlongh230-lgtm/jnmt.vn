import { lazy, Suspense } from "react";
import { AppProvider, useApp } from "@/context/AppContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import { getToken } from "@/lib/auth";

// Always-loaded (core pages, small)
import HomePage from "@/pages/HomePage";
import ChatPage from "@/pages/ChatPage";

// Lazy-loaded (split into separate chunks)
const DictionaryPage   = lazy(() => import("@/pages/DictionaryPage"));
const SchedulePage     = lazy(() => import("@/pages/SchedulePage"));
const MapPage          = lazy(() => import("@/pages/MapPage"));
const SubtitlePage     = lazy(() => import("@/pages/SubtitlePage"));
const ConversationPage = lazy(() => import("@/pages/ConversationPage"));
const VocabPage        = lazy(() => import("@/pages/VocabPage"));
const TimerPage        = lazy(() => import("@/pages/TimerPage"));
const DdayPage         = lazy(() => import("@/pages/DdayPage"));
const MenuPage         = lazy(() => import("@/pages/MenuPage"));
const TransportPage    = lazy(() => import("@/pages/TransportPage"));
const HealthPage       = lazy(() => import("@/pages/HealthPage"));
const AIChatPage       = lazy(() => import("@/pages/AIChatPage"));
const TinkercadPage    = lazy(() => import("@/pages/TinkercadPage"));
const WeatherPage      = lazy(() => import("@/pages/WeatherPage"));
const CurrencyPage     = lazy(() => import("@/pages/CurrencyPage"));
const GPAPage          = lazy(() => import("@/pages/GPAPage"));
const KoreanWordPage   = lazy(() => import("@/pages/KoreanWordPage"));
const QRCodePage       = lazy(() => import("@/pages/QRCodePage"));
const TimezonePage     = lazy(() => import("@/pages/TimezonePage"));
const AnnouncementsPage = lazy(() => import("@/pages/AnnouncementsPage"));
const AdminPage        = lazy(() => import("@/pages/AdminPage"));

setAuthTokenGetter(() => getToken());

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30 * 1000 },
  },
});

function PageLoader() {
  const { isDark } = useApp();
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "4rem 1rem", color: isDark ? "#94a3b8" : "#64748b", fontSize: "0.9rem", gap: "0.5rem" }}>
      <span style={{ display: "inline-block", width: 18, height: 18, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      Đang tải...
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function AppContent() {
  const { activePage, isDark } = useApp();

  return (
    <div style={{ minHeight: "100vh", background: isDark ? "#0f172a" : "#f8fafc", color: "var(--text)" }}>
      <Navbar />
      <main>
        {activePage === "home"          && <HomePage />}
        {activePage === "chat"          && <ChatPage />}
        <Suspense fallback={<PageLoader />}>
          {activePage === "dictionary"  && <DictionaryPage />}
          {activePage === "schedule"    && <SchedulePage />}
          {activePage === "map"         && <MapPage />}
          {activePage === "subtitle"    && <SubtitlePage />}
          {activePage === "conversation"&& <ConversationPage />}
          {activePage === "vocab"       && <VocabPage />}
          {activePage === "timer"       && <TimerPage />}
          {activePage === "dday"        && <DdayPage />}
          {activePage === "menu"        && <MenuPage />}
          {activePage === "transport"   && <TransportPage />}
          {activePage === "health"      && <HealthPage />}
          {activePage === "ai"          && <AIChatPage />}
          {activePage === "tinkercad"   && <TinkercadPage />}
          {activePage === "weather"     && <WeatherPage />}
          {activePage === "currency"    && <CurrencyPage />}
          {activePage === "gpa"         && <GPAPage />}
          {activePage === "koreanword"  && <KoreanWordPage />}
          {activePage === "qrcode"      && <QRCodePage />}
          {activePage === "timezone"    && <TimezonePage />}
          {activePage === "announcements"&&<AnnouncementsPage />}
          {activePage === "admin"       && <AdminPage />}
        </Suspense>
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
