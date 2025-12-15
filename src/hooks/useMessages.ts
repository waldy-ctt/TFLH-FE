import { useAppContext } from "@/contexts/AppContext";
import { api } from "@/services/api";
import { Message } from "@/types";
import { useCallback } from "react";

export function useMessages() {
  const { user, currentConv, setMessages } = useAppContext();

  // CRITICAL: Don't use messages in dependency, causes infinite loop
  const loadMessages = useCallback(async (convId: number) => {
    try {
      const data = await api.getMessages(convId);
      setMessages(data || []);
    } catch (error: any) {
      console.error("Failed to load messages:", error);
      setMessages([]);
    }
  }, [setMessages]); // ONLY depend on setMessages

  const sendMessage = async (content: string, replyToId?: number) => {
    if (!user || !currentConv) return;
    const result = await api.sendMessage(currentConv.id, user.id, content, replyToId);
    if (result && !result.error) {
      setMessages((prevMessages: Message[]) => [...prevMessages, result]);
    }
  };

  const deleteMessage = async (msgId: number) => {
    if (!user || !currentConv) return;
    await api.deleteMessage(msgId, user.id);
  };

  const reactToMessage = async (msgId: number, emoji: string) => {
    if (!user || !currentConv) return;
    await api.reactToMessage(msgId, user.id, emoji);
  };

  return {
    loadMessages,
    sendMessage,
    deleteMessage,
    reactToMessage,
  };
}
