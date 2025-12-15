import { useAppContext } from "@/contexts/AppContext";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

export default function ChatArea() {
  const { currentConv, isMobile } = useAppContext();

  if (!currentConv) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-4 bg-gray-50 overflow-hidden">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">💬</div>
          <p className="text-xl font-medium text-gray-600 mb-2">
            {isMobile ? "Select a conversation" : "Welcome to TFLH Chat"}
          </p>
          <p className="text-sm text-gray-500">
            {isMobile 
              ? "Choose from the menu to start chatting"
              : "Select a conversation from the sidebar or create a new one to get started"
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white">
      <ChatHeader />
      <MessageList />
      <MessageInput />
    </div>
  );
}
