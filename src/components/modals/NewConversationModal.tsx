import { useState, useEffect } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { useConversations } from "@/hooks/useConversations";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { User } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewConversationModal({ isOpen, onClose }: Props) {
  const { user } = useAppContext();
  const { createConversation, selectConversation } = useConversations();
  const [name, setName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    const data = await api.getAllUsers();
    setAllUsers(data);
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    const conv = await createConversation(name.trim(), selectedMembers);
    if (conv) {
      selectConversation(conv);
    }
    setName("");
    setSelectedMembers([]);
    onClose();
  };

  const handleClose = () => {
    setName("");
    setSelectedMembers([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="New Conversation">
      <Input
        placeholder="Conversation name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mb-4"
      />
      <div className="mb-4">
        <p className="text-sm font-medium mb-2">Select members:</p>
        <div className="max-h-48 sm:max-h-60 overflow-y-auto border rounded p-2">
          {allUsers
            .filter((u) => u.id !== user?.id)
            .map((u) => (
              <label
                key={u.id}
                className="flex items-center p-2 hover:bg-gray-50 cursor-pointer rounded"
              >
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(u.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedMembers([...selectedMembers, u.id]);
                    } else {
                      setSelectedMembers(
                        selectedMembers.filter((id) => id !== u.id)
                      );
                    }
                  }}
                  className="mr-2"
                />
                {u.username}
              </label>
            ))}
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={handleCreate} className="flex-1">
          Create
        </Button>
        <Button variant="outline" onClick={handleClose} className="flex-1">
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
