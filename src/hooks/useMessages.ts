import { useEffect } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { api } from "@/services/api";

export function useMessages() {
  const { user, currentConv, messages, setMessages } = useAppContext();

  const loadMessages = async (convId: number) => {
    const data = await api.getMessages(convId);
    setMessages(data);
  };

  const sendMessage = async (content: string, replyToId?: number) => {
    if (!user || !currentConv) return;
    await api.sendMessage(currentConv.id, user.id, content, replyToId);
    await loadMessages(currentConv.id);
  };

  const deleteMessage = async (msgId: number) => {
    if (!user || !currentConv) return;
    await api.deleteMessage(msgId, user.id);
    await loadMessages(currentConv.id);
  };

  const reactToMessage = async (msgId: number, emoji: string) => {
    if (!user || !currentConv) return;
    await api.reactToMessage(msgId, user.id, emoji);
    await loadMessages(currentConv.id);
  };

  // Auto-refresh messages
  useEffect(() => {
    if (currentConv && user) {
      const interval = setInterval(() => {
        loadMessages(currentConv.id);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [currentConv, user]);

  return {
    messages,
    loadMessages,
    sendMessage,
    deleteMessage,
    reactToMessage,
  };
}
