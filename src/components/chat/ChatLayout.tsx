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
  const isLoadingRef = useRef<{ [key: number]: boolean }>({});

  // CRITICAL: Always keep ref in sync with state
  useEffect(() => {
    currentConvRef.current = currentConv;
    console.log('ChatLayout: currentConv changed to', currentConv?.id, currentConv?.name);
  }, [currentConv]);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user, loadConversations]);

  // Load messages and members when conversation changes - ONLY depend on ID
  useEffect(() => {
    const convId = currentConv?.id;
    
    console.log('ChatLayout: Effect triggered for convId', convId);
    
    // If no conversation, clear everything
    if (!convId) {
      setMessages([]);
      setMembers([]);
      return;
    }
    
    // Check if already loading this conversation
    if (isLoadingRef.current[convId]) {
      console.log('ChatLayout: Already loading conversation', convId);
      return;
    }
    
    console.log('ChatLayout: Starting to load conversation', convId);
    isLoadingRef.current[convId] = true;
    
    const loadConversationData = async () => {
      try {
        // Double check we're still on the same conversation
        if (currentConvRef.current?.id !== convId) {
          console.log('ChatLayout: Conversation changed during load, aborting');
          return;
        }
        
        // Load members and messages in parallel
        await Promise.all([
          loadMembers(convId),
          loadMessages(convId)
        ]);
        
        console.log('ChatLayout: Finished loading conversation', convId);
      } catch (error) {
        console.error("Error loading conversation data:", error);
      } finally {
        delete isLoadingRef.current[convId];
      }
    };
    
    loadConversationData();
  }, [currentConv?.id, loadMembers, loadMessages, setMessages, setMembers]);

  // WebSocket handlers - use useCallback to keep them stable
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
      setCurrentConv(null);
      setShowSidebar(true);
      alert("This conversation has been deleted");
    }
    loadConversations();
  }, [setCurrentConv, setShowSidebar, loadConversations]);

  const handleNewMessage = useCallback((data: any) => {
    const currentId = currentConvRef.current?.id;
    console.log('ChatLayout: New message for conversation', data.conversationId, 'current is', currentId);
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
