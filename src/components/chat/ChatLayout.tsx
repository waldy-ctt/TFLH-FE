import { useEffect, useRef, useCallback } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { useConversations } from "@/hooks/useConversations";
import { useMembers } from "@/hooks/useMembers";
import { useMessages } from "@/hooks/useMessages";
import { wsService } from "@/services/websocket";
import Sidebar from "./Sidebar";
import ChatArea from "./ChatArea";

export default function ChatLayout() {
  const { user, currentConv, setCurrentConv, setMessages } = useAppContext();
  const { loadConversations } = useConversations();
  const { loadMembers } = useMembers();
  const { loadMessages } = useMessages();
  
  // Use ref to always have current conversation ID
  const currentConvRef = useRef(currentConv);
  
  useEffect(() => {
    currentConvRef.current = currentConv;
  }, [currentConv]);

  // Initial load
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user, loadConversations]);

  // WebSocket connection - separate effect, only depends on user
  useEffect(() => {
    if (!user) return;

    wsService.connect(user.id);

    // Handle WebSocket events - using useCallback to prevent recreating
    const handleConversationUpdated = (data: any) => {
      loadConversations();
    };

    const handleMemberAdded = (data: any) => {
      const currentId = currentConvRef.current?.id;
      if (currentId === data.conversationId) {
        loadMembers(data.conversationId);
      }
      loadConversations();
    };

    const handleJoinedConversation = (data: any) => {
      loadConversations();
    };

    const handleMemberLeft = (data: any) => {
      const currentId = currentConvRef.current?.id;
      if (currentId === data.conversationId) {
        loadMembers(data.conversationId);
      }
      loadConversations();
    };

    const handleMemberKicked = (data: any) => {
      if (data.userId === user.id) {
        setCurrentConv(null);
        alert("You have been removed from the conversation");
      } else {
        const currentId = currentConvRef.current?.id;
        if (currentId === data.conversationId) {
          loadMembers(data.conversationId);
        }
      }
      loadConversations();
    };

    const handleConversationDeleted = (data: any) => {
      const currentId = currentConvRef.current?.id;
      if (currentId === data.conversationId) {
        setCurrentConv(null);
        alert("This conversation has been deleted");
      }
      loadConversations();
    };

    const handleNewMessage = (data: any) => {
      const currentId = currentConvRef.current?.id;
      if (currentId === data.conversationId) {
        setMessages((prevMessages) => [...prevMessages, data.message]);
      }
    };

    const handleMessageDeleted = (data: any) => {
      const currentId = currentConvRef.current?.id;
      if (currentId === data.conversationId) {
        loadMessages(data.conversationId);
      }
    };

    const handleReactionAdded = (data: any) => {
      const currentId = currentConvRef.current?.id;
      if (currentId === data.conversationId) {
        loadMessages(data.conversationId);
      }
    };

    const handleReactionRemoved = (data: any) => {
      const currentId = currentConvRef.current?.id;
      if (currentId === data.conversationId) {
        loadMessages(data.conversationId);
      }
    };

    // Register event handlers
    wsService.on("conversation_updated", handleConversationUpdated);
    wsService.on("conversation_created", handleConversationUpdated);
    wsService.on("member_added", handleMemberAdded);
    wsService.on("joined_conversation", handleJoinedConversation);
    wsService.on("member_left", handleMemberLeft);
    wsService.on("member_kicked", handleMemberKicked);
    wsService.on("conversation_deleted", handleConversationDeleted);
    wsService.on("new_message", handleNewMessage);
    wsService.on("message_deleted", handleMessageDeleted);
    wsService.on("reaction_added", handleReactionAdded);
    wsService.on("reaction_removed", handleReactionRemoved);

    // Cleanup
    return () => {
      wsService.off("conversation_updated", handleConversationUpdated);
      wsService.off("conversation_created", handleConversationUpdated);
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
  }, [user]); // ONLY depend on user - nothing else!

  // Load members when conversation changes
  useEffect(() => {
    if (currentConv) {
      loadMembers(currentConv.id);
    }
  }, [currentConv, loadMembers]);

  return (
    <div className="h-screen flex flex-col md:flex-row bg-gray-100 overflow-hidden">
      <Sidebar />
      <ChatArea />
    </div>
  );
}
