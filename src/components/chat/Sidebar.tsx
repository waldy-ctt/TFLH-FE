import { useState, useCallback } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { useConversations } from "@/hooks/useConversations";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, Plus, Users } from "lucide-react";
import NewConversationModal from "@/components/modals/NewConversationModal";

export default function Sidebar() {
  const { user, conversations, currentConv, showSidebar, setShowSidebar, isMobile } = useAppContext();
  const { selectConversation } = useConversations();
  const { logout } = useAuth();
  const [showNewConv, setShowNewConv] = useState(false);

  const handleConversationClick = useCallback((conv: any) => {
    console.log('=== CONVERSATION CLICKED ===');
    console.log('Clicked conversation:', conv.id, conv.name);
    console.log('Current conversation:', currentConv?.id);
    
    selectConversation(conv);
  }, [selectConversation, currentConv?.id]);

  const handleBackdropClick = useCallback(() => {
    if (isMobile) {
      setShowSidebar(false);
    }
  }, [isMobile, setShowSidebar]);

  // Don't render sidebar at all when hidden on mobile
  if (isMobile && !showSidebar) {
    return null;
  }

  return (
    <>
      <div
        className={`${
          isMobile
            ? "fixed inset-0 z-50 bg-white"
            : "w-80 border-r bg-white"
        } flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-lg truncate">{user?.username}</h2>
              <p className="text-sm text-blue-100">Conversations</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="text-white hover:bg-white/20 active:bg-white/30"
                type="button"
              >
                <LogOut size={18} />
              </Button>
            </div>
          </div>
        </div>

        {/* Conversations List */}
        <div 
          className="flex-1 overflow-y-auto overscroll-contain"
          style={{
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <div className="text-4xl mb-2">💬</div>
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Create one to get started!</p>
            </div>
          ) : (
            conversations.map((conv) => {
              // CRITICAL: Direct comparison, no caching
              const isActive = currentConv !== null && currentConv.id === conv.id;
              
              console.log(`Conversation ${conv.id}: isActive=${isActive}, currentConv?.id=${currentConv?.id}`);
              
              return (
                <button
                  key={conv.id}
                  onClick={() => handleConversationClick(conv)}
                  className={`w-full p-4 text-left hover:bg-gray-50 active:bg-gray-100 border-b transition-colors ${
                    isActive
                      ? "bg-blue-50 border-l-4 border-l-blue-600"
                      : ""
                  }`}
                  type="button"
                  style={{
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold truncate text-sm sm:text-base ${
                        isActive ? "text-blue-700" : "text-gray-900"
                      }`}>
                        {conv.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        <Users size={12} className="inline mr-1" />
                        {conv.member_count} member
                        {conv.member_count !== 1 ? "s" : ""}
                      </p>
                    </div>
                    {isActive && (
                      <div className="ml-2 w-2 h-2 bg-blue-600 rounded-full" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* New Conversation Button */}
        <div className="p-4 border-t shrink-0 bg-white">
          <Button
            onClick={() => setShowNewConv(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 active:scale-95 transition-transform"
            type="button"
          >
            <Plus size={18} className="mr-2" />
            New Conversation
          </Button>
        </div>
      </div>

      {/* Mobile backdrop - only show when sidebar is visible */}
      {isMobile && showSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={handleBackdropClick}
          style={{
            WebkitTapHighlightColor: 'transparent',
          }}
        />
      )}

      <NewConversationModal 
        isOpen={showNewConv}
        onClose={() => setShowNewConv(false)}
      />
    </>
  );
}
