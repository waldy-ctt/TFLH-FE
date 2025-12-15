import { useState, useRef, useEffect } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { UserPlus, Edit2, Users, ChevronLeft, MoreVertical } from "lucide-react";
import AddMemberModal from "@/components/modals/AddMemberModal";
import ConversationSettingsModal from "@/components/modals/ConversationSettingsModal";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

export default function ChatScreen() {
  const { currentConv, members, navigateBack } = useAppContext();
  const [showAddMember, setShowAddMember] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showMenu]);

  if (!currentConv) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  const memberCount = members.length || currentConv.member_count || 0;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-white border-b p-3 flex items-center shadow-sm shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={navigateBack}
          className="shrink-0 -ml-2 mr-2"
          type="button"
          style={{
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <ChevronLeft size={24} />
        </Button>
        
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-gray-900 truncate">
            {currentConv.name}
          </h1>
          <p className="text-xs text-gray-500 truncate">
            <Users size={12} className="inline mr-1" />
            {memberCount} member{memberCount !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="relative shrink-0" ref={menuRef}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowMenu(!showMenu)}
            type="button"
            style={{
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <MoreVertical size={20} />
          </Button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[160px] z-30">
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowAddMember(true);
                }}
                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-3 active:bg-gray-100"
                type="button"
                style={{
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <UserPlus size={18} />
                Add Member
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowSettings(true);
                }}
                className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-3 active:bg-gray-100"
                type="button"
                style={{
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <Edit2 size={18} />
                Settings
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <MessageList />

      {/* Input */}
      <MessageInput />

      {/* Modals */}
      <AddMemberModal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
      />
      <ConversationSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}
