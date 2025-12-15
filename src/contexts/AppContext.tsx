import { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from "react";
import { User, Conversation, Member, Message } from "@/types";
import { authStorage } from "@/utils/auth";

type Screen = 'conversations' | 'chat';

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
  setMembers: Dispatch<SetStateAction<Member[]>>;
  
  // NEW: Stack-based navigation
  currentScreen: Screen;
  navigateToChat: (conv: Conversation) => void;
  navigateBack: () => void;
  
  isMobile: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConv, setCurrentConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [currentScreen, setCurrentScreen] = useState<Screen>('conversations');
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

  // CRITICAL: Stack-based navigation functions
  const navigateToChat = (conv: Conversation) => {
    console.log('📱 Navigate to chat:', conv.id, conv.name);
    
    // Set conversation FIRST
    setCurrentConv(conv);
    
    // Clear old data
    setMessages([]);
    setMembers([]);
    
    // Then navigate
    setCurrentScreen('chat');
  };

  const navigateBack = () => {
    console.log('📱 Navigate back to conversations');
    
    // Navigate first
    setCurrentScreen('conversations');
    
    // Then clear (prevents flashing)
    setTimeout(() => {
      setCurrentConv(null);
      setMessages([]);
      setMembers([]);
    }, 100);
  };

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
        currentScreen,
        navigateToChat,
        navigateBack,
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
