import { AppProvider, useAppContext } from "@/contexts/AppContext";
import AuthScreen from "@/components/auth/AuthScreen";
import ChatLayout from "@/components/chat/ChatLayout";

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
      <AppContent />
    </AppProvider>
  );
}

export default App;
