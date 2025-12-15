import { useAppContext } from "@/contexts/AppContext";
import { api } from "@/services/api";
import { Message } from "@/types";

export function useMessages() {
  const { user, currentConv, messages, setMessages } = useAppContext();

  const loadMessages = async (convId: number) => {
    const data = await api.getMessages(convId);
    setMessages(data);
  };

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
