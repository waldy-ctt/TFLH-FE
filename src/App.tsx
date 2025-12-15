import { AppProvider, useAppContext } from "@/contexts/AppContext";
import AuthScreen from "@/components/auth/AuthScreen";
import ChatLayout from "@/components/chat/ChatLayout";
import { VersionChecker } from "@/components/VersionChecker";

function AppContent() {
  const { user } = useAppContext();

  if (!user) {
    return <AuthScreen />;
  }

  return <ChatLayout />;
}

function App() {
  return (
    <AppProvider>
      <VersionChecker />
      <AppContent />
    </AppProvider>
  );
}

export default App;
