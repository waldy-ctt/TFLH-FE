/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useCallback } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { useConversations } from "@/hooks/useConversations";
import { useMembers } from "@/hooks/useMembers";
import { useMessages } from "@/hooks/useMessages";
import { wsService } from "@/services/websocket";
import Sidebar from "./Sidebar";
import ChatArea from "./ChatArea";

export default function ChatLayout() {
  const { user, currentConv, setCurrentConv, setMessages, setShowSidebar, setMembers } = useAppContext();
  const { loadConversations } = useConversations();
  const { loadMembers } = useMembers();
  const { loadMessages } = useMessages();

  const currentConvRef = useRef(currentConv);
  const loadedConvIdRef = useRef<number | null>(null);

  // Keep ref in sync
  useEffect(() => {
    currentConvRef.current = currentConv;
  }, [currentConv]);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user, loadConversations]);

  // CRITICAL FIX: Only load when conversation ID actually changes
  useEffect(() => {
    const convId = currentConv?.id;
    
    // If no conversation, clear everything
    if (!convId) {
      if (loadedConvIdRef.current !== null) {
        setMessages([]);
        setMembers([]);
        loadedConvIdRef.current = null;
      }
      return;
    }
    
    // CRITICAL: Skip if we already loaded this conversation
    if (loadedConvIdRef.current === convId) {
      return;
    }
    
    // Mark as loaded BEFORE loading to prevent duplicate calls
    loadedConvIdRef.current = convId;
    
    // Load data
    loadMembers(convId);
    loadMessages(convId);
  }, [currentConv?.id]); // ONLY depend on ID, not the whole object

  // WebSocket handlers
  const handleMemberAdded = useCallback((data: any) => {
    const currentId = currentConvRef.current?.id;
    if (currentId === data.conversationId) {
      loadMembers(data.conversationId);
    }
    loadConversations();
  }, [loadMembers, loadConversations]);

  const handleJoinedConversation = useCallback(() => {
    loadConversations();
  }, [loadConversations]);

  const handleMemberLeft = useCallback((data: any) => {
    const currentId = currentConvRef.current?.id;
    if (currentId === data.conversationId) {
      loadMembers(data.conversationId);
    }
    loadConversations();
  }, [loadMembers, loadConversations]);

  const handleMemberKicked = useCallback((data: any) => {
    if (data.userId === user?.id) {
      loadedConvIdRef.current = null; // Reset on kick
      setCurrentConv(null);
      setShowSidebar(true);
      alert("You have been removed from the conversation");
    } else {
      const currentId = currentConvRef.current?.id;
      if (currentId === data.conversationId) {
        loadMembers(data.conversationId);
      }
    }
    loadConversations();
  }, [user?.id, setCurrentConv, setShowSidebar, loadMembers, loadConversations]);

  const handleConversationDeleted = useCallback((data: any) => {
    const currentId = currentConvRef.current?.id;
    if (currentId === data.conversationId) {
      loadedConvIdRef.current = null; // Reset on delete
      setCurrentConv(null);
      setShowSidebar(true);
      alert("This conversation has been deleted");
    }
    loadConversations();
  }, [setCurrentConv, setShowSidebar, loadConversations]);

  const handleNewMessage = useCallback((data: any) => {
    const currentId = currentConvRef.current?.id;
    if (currentId === data.conversationId) {
      setMessages((prevMessages: any[]) => {
        const isDuplicate = prevMessages.some(m => m.id === data.message.id);
        if (isDuplicate) return prevMessages;
        return [...prevMessages, data.message];
      });
    }
  }, [setMessages]);

  const handleMessageDeleted = useCallback((data: any) => {
    const currentId = currentConvRef.current?.id;
    if (currentId === data.conversationId) {
      setMessages((prevMessages: any[]) => 
        prevMessages.filter(m => m.id !== data.messageId)
      );
    }
  }, [setMessages]);

  const handleReactionAdded = useCallback((data: any) => {
    const currentId = currentConvRef.current?.id;
    if (currentId === data.conversationId) {
      loadMessages(data.conversationId);
    }
  }, [loadMessages]);

  const handleReactionRemoved = useCallback((data: any) => {
    const currentId = currentConvRef.current?.id;
    if (currentId === data.conversationId) {
      loadMessages(data.conversationId);
    }
  }, [loadMessages]);

  const handleConversationCreated = useCallback(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!user) return;

    wsService.connect(user.id);

    wsService.on("conversation_created", handleConversationCreated);
    wsService.on("member_added", handleMemberAdded);
    wsService.on("joined_conversation", handleJoinedConversation);
    wsService.on("member_left", handleMemberLeft);
    wsService.on("member_kicked", handleMemberKicked);
    wsService.on("conversation_deleted", handleConversationDeleted);
    wsService.on("new_message", handleNewMessage);
    wsService.on("message_deleted", handleMessageDeleted);
    wsService.on("reaction_added", handleReactionAdded);
    wsService.on("reaction_removed", handleReactionRemoved);

    return () => {
      wsService.off("conversation_created", handleConversationCreated);
      wsService.off("member_added", handleMemberAdded);
      wsService.off("joined_conversation", handleJoinedConversation);
      wsService.off("member_left", handleMemberLeft);
      wsService.off("member_kicked", handleMemberKicked);
      wsService.off("conversation_deleted", handleConversationDeleted);
      wsService.off("new_message", handleNewMessage);
      wsService.off("message_deleted", handleMessageDeleted);
      wsService.off("reaction_added", handleReactionAdded);
      wsService.off("reaction_removed", handleReactionRemoved);
      wsService.disconnect();
    };
  }, [
    user,
    handleConversationCreated,
    handleMemberAdded,
    handleJoinedConversation,
    handleMemberLeft,
    handleMemberKicked,
    handleConversationDeleted,
    handleNewMessage,
    handleMessageDeleted,
    handleReactionAdded,
    handleReactionRemoved
  ]);

  return (
    <div
      className="h-screen w-screen flex flex-col md:flex-row bg-gray-100 fixed inset-0"
      style={{ 
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        overflow: "hidden"
      }}
    >
      <Sidebar />
      <ChatArea />
    </div>
  );
}
