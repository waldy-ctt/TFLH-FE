import { useEffect, useRef } from "react";
import { useAppContext } from "@/contexts/AppContext";
import MessageItem from "./MessageItem";

export default function MessageList() {
  const { currentConv, messages } = useAppContext();
  const messageEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastConvId = useRef<number | null>(null);
  const lastScrollHeight = useRef(0);

  // Log for debugging
  useEffect(() => {
    console.log('MessageList: currentConv =', currentConv?.id, currentConv?.name);
    console.log('MessageList: messages count =', messages.length);
  }, [currentConv?.id, messages.length]);

  // Scroll to bottom when conversation changes or new messages arrive
  useEffect(() => {
    const convChanged = currentConv?.id !== lastConvId.current;
    
    if (convChanged) {
      console.log('MessageList: Conversation changed from', lastConvId.current, 'to', currentConv?.id);
      lastConvId.current = currentConv?.id || null;
    }
    
    // Always scroll to bottom for new conversation or new messages
    if (messageEndRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const shouldScroll = convChanged || 
                          (container.scrollHeight !== lastScrollHeight.current &&
                           container.scrollTop + container.clientHeight >= lastScrollHeight.current - 100);
      
      if (shouldScroll) {
        setTimeout(() => {
          if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: convChanged ? "auto" : "smooth", block: "end" });
          }
        }, 50);
      }
      
      lastScrollHeight.current = container.scrollHeight;
    }
  }, [currentConv?.id, messages.length]);

  // Don't show anything if no conversation selected
  if (!currentConv) {
    return null;
  }

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
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <div className="text-center text-gray-400">
              <div className="text-4xl mb-2">💬</div>
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-1">Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageItem 
              key={`${currentConv.id}-${msg.id}`} 
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
