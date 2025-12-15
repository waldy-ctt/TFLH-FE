import { useAppContext } from "@/contexts/AppContext";
import { api } from "@/services/api";
import { Conversation } from "@/types";
import { useRef, useCallback } from "react";

export function useConversations() {
  const { user, currentConv, setConversations, setCurrentConv, setShowSidebar, setMessages, setMembers, isMobile } = useAppContext();
  const isSelectingRef = useRef(false);
  const selectionLockTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSelectedIdRef = useRef<number | null>(null);

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
    console.log('=== selectConversation START ===');
    console.log('Requested conversation:', conv.id, conv.name);
    console.log('Current conversation:', currentConv?.id, currentConv?.name);
    console.log('Selection lock:', isSelectingRef.current);
    console.log('Last selected ID:', lastSelectedIdRef.current);
    
    // Prevent multiple simultaneous selections
    if (isSelectingRef.current) {
      console.log('BLOCKED: Selection in progress');
      console.log('=== selectConversation END (blocked) ===');
      return;
    }

    // Check if this is actually a different conversation
    const isDifferentConversation = currentConv?.id !== conv.id;
    
    console.log('Is different conversation?', isDifferentConversation);
    
    if (!isDifferentConversation) {
      console.log('Same conversation, just hiding sidebar');
      if (isMobile) {
        setShowSidebar(false);
      }
      console.log('=== selectConversation END (same conv) ===');
      return;
    }
    
    console.log('PROCEEDING with selection');
    
    // Set lock FIRST
    isSelectingRef.current = true;
    lastSelectedIdRef.current = conv.id;
    
    // Clear any existing timeout
    if (selectionLockTimeoutRef.current) {
      clearTimeout(selectionLockTimeoutRef.current);
    }
    
    // CRITICAL: Clear everything in the right order
    console.log('Clearing messages and members...');
    setMessages([]);
    setMembers([]);
    
    // Small delay to ensure state clears
    setTimeout(() => {
      console.log('Setting new conversation:', conv.id, conv.name);
      setCurrentConv(conv);
      
      // Hide sidebar on mobile
      if (isMobile) {
        setShowSidebar(false);
      }
      
      console.log('=== selectConversation END (success) ===');
    }, 50);
    
    // Release lock after a delay
    selectionLockTimeoutRef.current = setTimeout(() => {
      isSelectingRef.current = false;
      console.log('Selection lock released');
    }, 500);
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
