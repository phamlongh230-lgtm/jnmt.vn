import { AppProvider, useApp } from "@/context/AppContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import HomePage from "@/pages/HomePage";
import DictionaryPage from "@/pages/DictionaryPage";
import SchedulePage from "@/pages/SchedulePage";
import ChatPage from "@/pages/ChatPage";
import MapPage from "@/pages/MapPage";
import SubtitlePage from "@/pages/SubtitlePage";
import ConversationPage from "@/pages/ConversationPage";
import VocabPage from "@/pages/VocabPage";
import TimerPage from "@/pages/TimerPage";
import DdayPage from "@/pages/DdayPage";
import MenuPage from "@/pages/MenuPage";
import TransportPage from "@/pages/TransportPage";
import HealthPage from "@/pages/HealthPage";
import AIChatPage from "@/pages/AIChatPage";
import { getToken } from "@/lib/auth";

setAuthTokenGetter(() => getToken());

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30 * 1000,
    },
  },
});

function AppContent() {
  const { activePage, isDark } = useApp();

  return (
    <div style={{ minHeight: "100vh", background: isDark ? "#0f172a" : "#f8fafc", color: "var(--text)" }}>
      <Navbar />
      <main>
        {activePage === "home" && <HomePage />}
        {activePage === "dictionary" && <DictionaryPage />}
        {activePage === "schedule" && <SchedulePage />}
        {activePage === "chat" && <ChatPage />}
        {activePage === "map" && <MapPage />}
        {activePage === "subtitle" && <SubtitlePage />}
        {activePage === "conversation" && <ConversationPage />}
        {activePage === "vocab" && <VocabPage />}
        {activePage === "timer" && <TimerPage />}
        {activePage === "dday" && <DdayPage />}
        {activePage === "menu" && <MenuPage />}
        {activePage === "transport" && <TransportPage />}
        {activePage === "health" && <HealthPage />}
        {activePage === "ai" && <AIChatPage />}
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
