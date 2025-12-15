import { useEffect } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { useConversations } from "@/hooks/useConversations";
import Sidebar from "./Sidebar";
import ChatArea from "./ChatArea";

export default function ChatLayout() {
  const { user, currentConv } = useAppContext();
  const { loadConversations } = useConversations();

  useEffect(() => {
    if (user) {
      loadConversations();
      const interval = setInterval(() => loadConversations(), 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <div className="h-screen flex flex-col md:flex-row bg-gray-100 overflow-hidden">
      <Sidebar />
      <ChatArea />
    </div>
  );
}
