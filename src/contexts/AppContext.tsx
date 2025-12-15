import { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from "react";
import { User, Conversation, Member, Message } from "@/types";
import { authStorage } from "@/utils/auth";

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  conversations: Conversation[];
  setConversations: (convs: Conversation[]) => void;
  currentConv: Conversation | null;
  setCurrentConv: (conv: Conversation | null) => void;
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>; 
  members: Member[];
  setMembers: (members: Member[]) => void;
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
  isMobile: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConv, setCurrentConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Load user from storage on mount
  useEffect(() => {
    const savedUser = authStorage.getUser();
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        conversations,
        setConversations,
        currentConv,
        setCurrentConv,
        messages,
        setMessages,
        members,
        setMembers,
        showSidebar,
        setShowSidebar,
        isMobile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
}
