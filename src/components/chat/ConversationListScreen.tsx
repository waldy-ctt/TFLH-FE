import { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, Plus, Users } from "lucide-react";
import NewConversationModal from "@/components/modals/NewConversationModal";

export default function ConversationListScreen() {
  const { user, conversations, navigateToChat } = useAppContext();
  const { logout } = useAuth();
  const [showNewConv, setShowNewConv] = useState(false);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-lg truncate">{user?.username}</h2>
            <p className="text-sm text-blue-100">Conversations</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="text-white hover:bg-white/20 active:bg-white/30 shrink-0"
            type="button"
            style={{
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <LogOut size={18} />
          </Button>
        </div>
      </div>

      {/* Conversations List */}
      <div 
        className="flex-1 overflow-y-auto"
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
        }}
      >
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-lg font-medium text-gray-600 mb-2">No conversations yet</p>
            <p className="text-sm text-gray-500">Create one to get started!</p>
          </div>
        ) : (
          <div className="divide-y">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => navigateToChat(conv)}
                className="w-full p-4 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors"
                type="button"
                style={{
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="font-semibold text-gray-900 truncate text-base">
                      {conv.name}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      <Users size={14} className="inline mr-1" />
                      {conv.member_count} member{conv.member_count !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-gray-400">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* New Conversation Button */}
      <div className="p-4 border-t shrink-0 bg-white">
        <Button
          onClick={() => setShowNewConv(true)}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-98 transition-transform h-12 text-base font-medium"
          type="button"
          style={{
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <Plus size={20} className="mr-2" />
          New Conversation
        </Button>
      </div>

      <NewConversationModal 
        isOpen={showNewConv}
        onClose={() => setShowNewConv(false)}
      />
    </div>
  );
}
