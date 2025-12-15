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
    const result = await api.sendMessage(currentConv.id, user.id, content, replyToId);
    // Add the message immediately for the sender
    if (result && !result.error) {
      setMessages((prevMessages) => [...prevMessages, result]);
    }
  };

  const deleteMessage = async (msgId: number) => {
    if (!user || !currentConv) return;
    await api.deleteMessage(msgId, user.id);
    // No need to reload - WebSocket will handle it
  };

  const reactToMessage = async (msgId: number, emoji: string) => {
    if (!user || !currentConv) return;
    await api.reactToMessage(msgId, user.id, emoji);
    // No need to reload - WebSocket will handle it
  };

  // No more polling - WebSocket handles real-time updates

  return {
    messages,
    loadMessages,
    sendMessage,
    deleteMessage,
    reactToMessage,
  };
}
