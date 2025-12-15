import { useAppContext } from "@/contexts/AppContext";
import { api } from "@/services/api";
import { useCallback } from "react";

export function useConversations() {
  const { user, setConversations, navigateToChat } = useAppContext();

  const loadConversations = useCallback(async () => {
    if (!user) return;
    const data = await api.getConversations(user.id);
    setConversations(data);
  }, [user, setConversations]);

  const createConversation = useCallback(async (name: string, memberIds: number[]) => {
    if (!user) return null;
    const data = await api.createConversation(name, user.id, memberIds);
    await loadConversations();
    return data;
  }, [user, loadConversations]);

  const selectConversation = useCallback((conv: any) => {
    navigateToChat(conv);
  }, [navigateToChat]);

  const updateConversationName = useCallback(async (convId: number, name: string) => {
    if (!user) return;
    await api.updateConversationName(convId, name, user.id);
    await loadConversations();
  }, [user, loadConversations]);

  return {
    loadConversations,
    createConversation,
    selectConversation,
    updateConversationName,
  };
}
