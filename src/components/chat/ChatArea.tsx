import { useAppContext } from "@/contexts/AppContext";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function ChatArea() {
  const { currentConv, setShowSidebar, isMobile } = useAppContext();

  if (!currentConv) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-4">
        {isMobile && (
          <Button
            variant="outline"
            onClick={() => setShowSidebar(true)}
            className="mb-4"
          >
            <Menu size={18} className="mr-2" />
            Show Conversations
          </Button>
        )}
        <div className="text-center">
          <div className="text-5xl sm:text-6xl mb-4">💬</div>
          <p className="text-lg sm:text-xl">
            Select a conversation to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <ChatHeader />
      <MessageList />
      <MessageInput />
    </div>
  );
}
