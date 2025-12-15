import { useAppContext } from "@/contexts/AppContext";
import { api } from "@/services/api";
import { useCallback } from "react";

export function useMembers() {
  const { currentConv, setMembers } = useAppContext();

  // CRITICAL: Stable function that doesn't cause re-renders
  const loadMembers = useCallback(async (convId: number) => {
    const data = await api.getMembers(convId);
    setMembers(data);
  }, [setMembers]); // ONLY depend on setMembers

  const addMember = async (userId: number) => {
    if (!currentConv) return;
    const res = await api.addMember(currentConv.id, userId);
    if (!res.error) {
      await loadMembers(currentConv.id);
    }
  };

  return {
    loadMembers,
    addMember,
  };
}
