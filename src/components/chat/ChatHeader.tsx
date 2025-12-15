/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect, useMemo } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { UserPlus, Edit2, Users, ChevronLeft, MoreVertical } from "lucide-react";
import AddMemberModal from "@/components/modals/AddMemberModal";
import ConversationSettingsModal from "@/components/modals/ConversationSettingsModal";

export default function ChatHeader() {
  const { currentConv, members, setShowSidebar, setCurrentConv, isMobile } = useAppContext();
  const [showAddMember, setShowAddMember] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Log for debugging
  useEffect(() => {
    console.log('ChatHeader: currentConv =', currentConv?.id, currentConv?.name);
  }, [currentConv?.id, currentConv?.name]);

  // Memoize conversation data to prevent flickering
  const displayData = useMemo(() => {
    if (!currentConv) return null;
    
    return {
      id: currentConv.id,
      name: currentConv.name,
      memberCount: members.length || currentConv.member_count || 0
    };
  }, [currentConv?.id, currentConv?.name, members.length, currentConv?.member_count]);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false);
      }
    }

    if (showMobileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside as any);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside as any);
    };
  }, [showMobileMenu]);

  const handleBackClick = () => {
    console.log('ChatHeader: Back button clicked');
    setCurrentConv(null);
    setShowSidebar(true);
  };

  if (!displayData) return null;

  return (
    <>
      <div className="bg-white border-b p-3 sm:p-4 flex justify-between items-center shadow-sm shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackClick}
              className="shrink-0 -ml-2"
              type="button"
            >
              <ChevronLeft size={24} />
            </Button>
          )}
          
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">
              {displayData.name}
            </h1>
            <p className="text-xs text-gray-500 truncate">
              <Users size={12} className="inline mr-1" />
              {displayData.memberCount} member{displayData.memberCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Desktop buttons */}
        <div className="hidden sm:flex gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddMember(true)}
            type="button"
          >
            <UserPlus size={16} className="mr-2" />
            Add
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowSettings(true)}
            type="button"
          >
            <Edit2 size={16} />
          </Button>
        </div>

        {/* Mobile menu button */}
        <div className="sm:hidden relative" ref={menuRef}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            type="button"
            className="shrink-0"
          >
            <MoreVertical size={20} />
          </Button>

          {/* Mobile dropdown menu */}
          {showMobileMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[160px] z-30">
              <button
                onClick={() => {
                  setShowMobileMenu(false);
                  setShowAddMember(true);
                }}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 active:bg-gray-100"
                type="button"
              >
                <UserPlus size={16} />
                Add Member
              </button>
              <button
                onClick={() => {
                  setShowMobileMenu(false);
                  setShowSettings(true);
                }}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 active:bg-gray-100"
                type="button"
              >
                <Edit2 size={16} />
                Settings
              </button>
            </div>
          )}
        </div>
      </div>

      <AddMemberModal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
      />
      <ConversationSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
}
