import { useEffect, useRef } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { useMessages } from "@/hooks/useMessages";
import MessageItem from "./MessageItem";

export default function MessageList() {
  const { currentConv } = useAppContext();
  const { messages, loadMessages } = useMessages();
  const messageEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isAutoScrolling = useRef(false);
  const lastMessageCount = useRef(0);

  useEffect(() => {
    if (currentConv) {
      loadMessages(currentConv.id);
    }
  }, [currentConv, loadMessages]);

  useEffect(() => {
    // Only auto-scroll when new messages arrive
    if (messages.length > lastMessageCount.current && messageEndRef.current && !isAutoScrolling.current) {
      isAutoScrolling.current = true;
      lastMessageCount.current = messages.length;
      
      // Use setTimeout for smoother Android scrolling
      setTimeout(() => {
        if (messageEndRef.current) {
          messageEndRef.current.scrollIntoView({ 
            behavior: "smooth",
            block: "end"
          });
        }
        
        setTimeout(() => {
          isAutoScrolling.current = false;
        }, 300);
      }, 100);
    }
  }, [messages]);

  return (
    <div 
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gray-50"
      style={{
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        willChange: 'scroll-position',
      }}
    >
      <div className="max-w-4xl mx-auto space-y-4 pb-2">
        {messages.map((msg, index) => (
          <MessageItem key={msg.id} message={msg} index={index} />
        ))}
        <div ref={messageEndRef} className="h-1" />
      </div>
    </div>
  );
}
