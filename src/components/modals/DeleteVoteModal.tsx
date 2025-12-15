import { useAppContext } from "@/contexts/AppContext";
import { api } from "@/services/api";
import { useConversations } from "@/hooks/useConversations";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteVoteModal({ isOpen, onClose }: Props) {
  const { user, currentConv, members, setCurrentConv, navigateBack } = useAppContext();
  const { loadConversations } = useConversations();

  const handleVote = async (vote: boolean) => {
    if (!currentConv || !user) return;

    const res = await api.voteDeleteConversation(currentConv.id, user.id, vote);

    onClose();

    if (res.deleted) {
      setCurrentConv(null);
      await loadConversations();
      navigateBack();
      alert("Conversation has been deleted.");
    } else {
      alert(
        `Vote recorded. All ${members.length} members must agree to delete.`
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Conversation">
      <div className="space-y-4">
        <p className="text-sm">
          Vote to permanently delete <strong>{currentConv?.name}</strong>?
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm text-amber-800">
            <Bell size={16} />
            <span>All members must agree to delete</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => handleVote(true)}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            Vote Yes
          </Button>
          <Button
            variant="outline"
            onClick={() => handleVote(false)}
            className="flex-1"
          >
            Vote No
          </Button>
        </div>
      </div>
    </Modal>
  );
}
