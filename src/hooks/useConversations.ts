import { useAppContext } from "@/contexts/AppContext";
import { api } from "@/services/api";
import { Conversation } from "@/types";
import { useRef, useCallback } from "react";

export function useConversations() {
  const { user, currentConv, setConversations, setCurrentConv, setShowSidebar, setMessages, setMembers, isMobile } = useAppContext();
  const isSelectingRef = useRef(false);
  const pendingSelectionRef = useRef<number | null>(null);

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

  const selectConversation = useCallback((conv: Conversation) => {
    // Prevent multiple simultaneous selections
    if (isSelectingRef.current) {
      console.log('Selection in progress, ignoring click');
      return;
    }

    // If selecting the same conversation, just hide sidebar on mobile
    if (currentConv?.id === conv.id) {
      if (isMobile) {
        setShowSidebar(false);
      }
      return;
    }
    
    console.log('Selecting conversation:', conv.id, conv.name);
    
    isSelectingRef.current = true;
    pendingSelectionRef.current = conv.id;
    
    // Clear old data immediately
    setMessages([]);
    setMembers([]);
    
    // Set new conversation
    setCurrentConv(conv);
    
    // Hide sidebar on mobile when selecting a conversation
    if (isMobile) {
      setShowSidebar(false);
    }
    
    // Reset the lock after state updates complete
    setTimeout(() => {
      isSelectingRef.current = false;
      pendingSelectionRef.current = null;
    }, 200);
  }, [currentConv?.id, isMobile, setMessages, setMembers, setCurrentConv, setShowSidebar]);

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
