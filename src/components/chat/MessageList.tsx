import { useEffect, useRef } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { useMessages } from "@/hooks/useMessages";
import MessageItem from "./MessageItem";

export default function MessageList() {
  const { currentConv } = useAppContext();
  const { messages, loadMessages } = useMessages();
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentConv) {
      loadMessages(currentConv.id);
    }
  }, [currentConv]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-4">
        {messages.map((msg, index) => (
          <MessageItem key={msg.id} message={msg} index={index} />
        ))}
        <div ref={messageEndRef} />
      </div>
    </div>
  );
}
