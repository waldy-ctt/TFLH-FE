import { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { UserPlus, Edit2, Menu, Users } from "lucide-react";
import AddMemberModal from "@/components/modals/AddMemberModal";
import ConversationSettingsModal from "@/components/modals/ConversationSettingsModal";

export default function ChatHeader() {
  const { currentConv, members, setShowSidebar, isMobile } = useAppContext();
  const [showAddMember, setShowAddMember] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <div className="bg-white border-b p-3 sm:p-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSidebar(true)}
              className="shrink-0"
            >
              <Menu size={20} />
            </Button>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
              {currentConv?.name}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 truncate">
              <Users size={12} className="inline mr-1" />
              {members.length} member{members.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex gap-1 sm:gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddMember(true)}
            className="hidden sm:flex"
          >
            <UserPlus size={16} className="mr-2" />
            Add
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowAddMember(true)}
            className="sm:hidden"
          >
            <UserPlus size={16} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowSettings(true)}
          >
            <Edit2 size={16} />
          </Button>
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
