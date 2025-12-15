import { useAppContext } from "@/contexts/AppContext";
import { api } from "@/services/api";
import { Conversation } from "@/types";

export function useConversations() {
  const { user, currentConv, setConversations, setCurrentConv, setShowSidebar, isMobile } = useAppContext();

  const loadConversations = async () => {
    if (!user) return;
    const data = await api.getConversations(user.id);
    setConversations(data);
    
    // Update currentConv if it exists in the new data
    if (currentConv) {
      const updatedConv = data.find((c: Conversation) => c.id === currentConv.id);
      if (updatedConv) {
        setCurrentConv(updatedConv);
      }
    }
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
