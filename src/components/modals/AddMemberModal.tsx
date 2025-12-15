import { useState, useEffect } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { useMembers } from "@/hooks/useMembers";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { User } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddMemberModal({ isOpen, onClose }: Props) {
  const { members } = useAppContext();
  const { addMember } = useMembers();
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

  const handleAdd = async (userId: number) => {
    await addMember(userId);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Member">
      <div className="max-h-48 sm:max-h-60 overflow-y-auto border rounded p-2">
        {allUsers
          .filter((u) => !members.some((m) => m.id === u.id))
          .map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
            >
              <span className="text-sm sm:text-base">{u.username}</span>
              <Button size="sm" onClick={() => handleAdd(u.id)}>
                Add
              </Button>
            </div>
          ))}
      </div>
    </Modal>
  );
}
