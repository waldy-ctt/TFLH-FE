import { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { useConversations } from "@/hooks/useConversations";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LogOut, Plus, Users, XIcon } from "lucide-react"; // Remove Menu
import NewConversationModal from "@/components/modals/NewConversationModal";

export default function Sidebar() {
  const { user, conversations, currentConv, showSidebar, setShowSidebar, isMobile } = useAppContext();
  const { selectConversation } = useConversations();
  const { logout } = useAuth();
  const [showNewConv, setShowNewConv] = useState(false);

  return (
    <>
      <div
        className={`${
          isMobile
            ? `fixed inset-0 z-50 bg-white transform transition-transform ${
                showSidebar ? "translate-x-0" : "-translate-x-full"
              }`
            : "w-80 border-r bg-white"
        } flex flex-col`}
      >
        <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="font-bold text-lg">{user?.username}</h2>
              <p className="text-sm text-blue-100">Conversations</p>
            </div>
            <div className="flex gap-2">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSidebar(false)}
                  className="text-white hover:bg-white/20"
                >
                  <XIcon size={18} />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="text-white hover:bg-white/20"
              >
                <LogOut size={18} />
              </Button>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => selectConversation(conv)}
              className={`p-4 cursor-pointer hover:bg-gray-50 border-b transition-colors ${
                currentConv?.id === conv.id
                  ? "bg-blue-50 border-l-4 border-l-blue-600"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {conv.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    <Users size={12} className="inline mr-1" />
                    {conv.member_count} member
                    {conv.member_count !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>

        <div className="p-4 border-t">
          <Button
            onClick={() => setShowNewConv(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
          >
            <Plus size={18} className="mr-2" />
            New Conversation
          </Button>
        </div>
      </div>

      {isMobile && showSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowSidebar(false)}
        />
      )}

      <NewConversationModal 
        isOpen={showNewConv}
        onClose={() => setShowNewConv(false)}
      />
    </>
  );
}
