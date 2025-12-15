import { useEffect, useRef } from "react";
import { useAppContext } from "@/contexts/AppContext";
import MessageItem from "./MessageItem";

export default function MessageList() {
  const { currentConv, messages } = useAppContext();
  const messageEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastMessageCountRef = useRef(0);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > lastMessageCountRef.current) {
      requestAnimationFrame(() => {
        if (messageEndRef.current) {
          messageEndRef.current.scrollIntoView({ 
            behavior: messages.length === 1 ? "auto" : "smooth",
            block: "end" 
          });
        }
      });
    }
    lastMessageCountRef.current = messages.length;
  }, [messages.length]);

  // Initial scroll on conversation load
  useEffect(() => {
    if (currentConv && messages.length > 0) {
      setTimeout(() => {
        if (messageEndRef.current) {
          messageEndRef.current.scrollIntoView({ 
            behavior: "auto",
            block: "end" 
          });
        }
      }, 100);
    }
  }, [currentConv?.id]);

  if (!currentConv) {
    return null;
  }

  // Only show messages for current conversation
  const currentMessages = messages.filter(msg => msg.conversation_id === currentConv.id);

  return (
    <div 
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto p-3 bg-gray-50"
      style={{
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
      }}
    >
      <div className="space-y-4 pb-2">
        {currentMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <div className="text-center text-gray-400">
              <div className="text-5xl mb-3">💬</div>
              <p className="text-base font-medium">No messages yet</p>
              <p className="text-sm mt-1">Start the conversation!</p>
            </div>
          </div>
        ) : (
          currentMessages.map((msg) => (
            <MessageItem 
              key={`msg-${msg.id}`}
              message={msg} 
              index={msg.id} 
            />
          ))
        )}
        <div ref={messageEndRef} className="h-1" />
      </div>
    </div>
  );
}
