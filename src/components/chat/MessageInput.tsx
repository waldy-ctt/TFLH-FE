import { useState } from "react";
import { useMessages } from "@/hooks/useMessages";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Reply, X as XIcon } from "lucide-react";
import { Message } from "@/types";

export default function MessageInput() {
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const { sendMessage } = useMessages();
  const { isMobile } = useAppContext();

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage(input.trim(), replyTo?.id);
    setInput("");
    setReplyTo(null);
  };

  return (
    <div className="bg-white border-t p-3 sm:p-4">
      {replyTo && (
        <div className="max-w-4xl mx-auto mb-2 p-2 bg-blue-50 border-l-4 border-blue-500 rounded flex justify-between items-center">
          <div className="flex-1 min-w-0">
            <span className="text-xs text-blue-700 font-medium flex items-center gap-1">
              <Reply size={12} />
              Replying to {replyTo.username}
            </span>
            <p className="text-sm text-gray-600 truncate">
              {replyTo.content}
            </p>
          </div>
          <button
            onClick={() => setReplyTo(null)}
            className="text-gray-500 hover:text-gray-700 ml-2"
          >
            <XIcon size={16} />
          </button>
        </div>
      )}
      <div className="max-w-4xl mx-auto flex gap-2">
        <Input
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && !e.shiftKey && handleSend()
          }
          className="flex-1"
        />
        <Button
          onClick={handleSend}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 shrink-0"
          size={isMobile ? "icon" : "default"}
        >
          {isMobile ? <Send size={18} /> : "Send"}
        </Button>
      </div>
    </div>
  );
}
