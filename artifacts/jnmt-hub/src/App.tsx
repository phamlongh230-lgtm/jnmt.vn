import { AppProvider, useApp } from "@/context/AppContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import HomePage from "@/pages/HomePage";
import DictionaryPage from "@/pages/DictionaryPage";
import SchedulePage from "@/pages/SchedulePage";
import ChatPage from "@/pages/ChatPage";
import MapPage from "@/pages/MapPage";
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
  const { activePage } = useApp();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <Navbar />
      <main>
        {activePage === "home" && <HomePage />}
        {activePage === "dictionary" && <DictionaryPage />}
        {activePage === "schedule" && <SchedulePage />}
        {activePage === "chat" && <ChatPage />}
        {activePage === "map" && <MapPage />}
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
