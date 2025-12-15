import { useAppContext } from "@/contexts/AppContext";
import { api } from "@/services/api";

export function useMembers() {
  const { currentConv, setMembers } = useAppContext();

  const loadMembers = async (convId: number) => {
    const data = await api.getMembers(convId);
    setMembers(data);
  };

  const addMember = async (userId: number) => {
    if (!currentConv) return;
    const res = await api.addMember(currentConv.id, userId);
    if (!res.error) {
      await loadMembers(currentConv.id);
    }
  };

  const leaveConversation = async () => {
    if (!currentConv) return;
    // Will be implemented in component
  };

  return {
    loadMembers,
    addMember,
    leaveConversation,
  };
}
