import { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { useConversations } from "@/hooks/useConversations";
import { api } from "@/services/api";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit2, UserMinus, DoorOpen, Trash2 } from "lucide-react";
import KickVoteModal from "./KickVoteModal";
import DeleteVoteModal from "./DeleteVoteModal";
import { Member } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConversationSettingsModal({ isOpen, onClose }: Props) {
  const { user, currentConv, members, setCurrentConv, setShowSidebar, isMobile } = useAppContext();
  const { updateConversationName, loadConversations } = useConversations();
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [showKickModal, setShowKickModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [kickTarget, setKickTarget] = useState<Member | null>(null);

  const handleUpdateName = async () => {
    if (!currentConv || !newName.trim()) return;
    await updateConversationName(currentConv.id, newName.trim());
    setEditingName(false);
    setNewName("");
  };

  const handleLeave = async () => {
    if (!currentConv || !user) return;
    await api.leaveConversation(currentConv.id, user.id);
    setCurrentConv(null);
    await loadConversations();
    onClose();
    if (isMobile) {
      setShowSidebar(true);
    }
  };

  const handleKickClick = (member: Member) => {
    setKickTarget(member);
    setShowKickModal(true);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Conversation Settings">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Conversation Name</p>
            {editingName ? (
              <div className="flex gap-2">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="New name"
                  className="flex-1"
                />
                <Button size="sm" onClick={handleUpdateName}>
                  Save
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">{currentConv?.name}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingName(true);
                    setNewName(currentConv?.name || "");
                  }}
                >
                  <Edit2 size={14} />
                </Button>
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-medium mb-2">
              Members ({members.length})
            </p>
            <div className="max-h-32 sm:max-h-40 overflow-y-auto border rounded p-2">
              {members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded mb-1"
                >
                  <span className="text-sm">{m.username}</span>
                  {m.id !== user?.id && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleKickClick(m)}
                    >
                      <UserMinus size={14} className="mr-1" />
                      <span className="hidden sm:inline">Kick</span>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLeave}
            >
              <DoorOpen size={16} className="mr-2" />
              Leave Conversation
            </Button>
            <Button
              variant="destructive"
              className="w-full justify-start"
              onClick={() => {
                onClose();
                setShowDeleteModal(true);
              }}
            >
              <Trash2 size={16} className="mr-2" />
              Delete Conversation
            </Button>
          </div>
        </div>
      </Modal>

      <KickVoteModal
        isOpen={showKickModal}
        onClose={() => {
          setShowKickModal(false);
          setKickTarget(null);
        }}
        target={kickTarget}
      />

      <DeleteVoteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
    </>
  );
}
