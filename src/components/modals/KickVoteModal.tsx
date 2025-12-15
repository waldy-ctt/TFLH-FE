import { useMemo } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { api } from "@/services/api";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { Member } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  target: Member | null;
}

export default function KickVoteModal({ isOpen, onClose, target }: Props) {
  const { user, conversations, currentConvId, members } = useAppContext();

  const currentConv = useMemo(() => {
    return conversations.find(c => c.id === currentConvId);
  }, [conversations, currentConvId]);

  const handleVote = async (vote: boolean) => {
    if (!currentConv || !target || !user) return;

    const res = await api.voteKick(currentConv.id, target.id, user.id, vote);

    onClose();

    if (res.kicked) {
      alert(`${target.username} has been removed from the conversation.`);
    } else {
      alert(
        `Vote recorded. ${Math.ceil(members.length * 0.7)} votes needed to remove member.`
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Vote to Remove Member">
      <div className="space-y-4">
        <p className="text-sm">
          Vote to remove <strong>{target?.username}</strong> from this
          conversation?
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <Bell size={16} />
            <span>Requires 70% approval from all members</span>
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
