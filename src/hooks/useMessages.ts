import { useAppContext } from "@/contexts/AppContext";
import { api } from "@/services/api";
import { Message } from "@/types";
import { useCallback, useRef } from "react";

export function useMessages() {
  const { user, currentConv, messages, setMessages } = useAppContext();
  const loadingConvId = useRef<number | null>(null);
  const lastLoadedConvId = useRef<number | null>(null);

  const loadMessages = useCallback(async (convId: number) => {
    // Skip if already loaded this conversation
    if (lastLoadedConvId.current === convId && messages.length > 0) {
      return;
    }
    
    loadingConvId.current = convId;
    
    try {
      const data = await api.getMessages(convId);
      
      // Only set messages if we're still viewing this conversation
      if (loadingConvId.current === convId) {
        setMessages(data || []);
        lastLoadedConvId.current = convId;
      }
    } catch (error: any) {
      console.error("Failed to load messages:", error);
      // Set empty array on error
      if (loadingConvId.current === convId) {
        setMessages([]);
        lastLoadedConvId.current = null;
      }
    }
  }, [setMessages, messages.length]);

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
    messages,
    loadMessages,
    sendMessage,
    deleteMessage,
    reactToMessage,
  };
}
