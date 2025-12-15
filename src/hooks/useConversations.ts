import { useAppContext } from "@/contexts/AppContext";
import { api } from "@/services/api";
import { Conversation } from "@/types";

export function useConversations() {
  const { user, setConversations, setCurrentConv, setShowSidebar, isMobile } = useAppContext();

  const loadConversations = async () => {
    if (!user) return;
    const data = await api.getConversations(user.id);
    setConversations(data);
  };

  const createConversation = async (name: string, memberIds: number[]) => {
    if (!user) return null;
    const data = await api.createConversation(name, user.id, memberIds);
    await loadConversations();
    return data;
  };

  const selectConversation = (conv: Conversation) => {
    setCurrentConv(conv);
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const updateConversationName = async (convId: number, name: string) => {
    if (!user) return;
    await api.updateConversationName(convId, name, user.id);
    await loadConversations();
  };

  return {
    loadConversations,
    createConversation,
    selectConversation,
    updateConversationName,
  };
}
