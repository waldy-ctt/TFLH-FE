import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Modal } from "@/components/ui/modal";
import {
  LogOut,
  Plus,
  UserPlus,
  Edit2,
  Trash2,
  UserMinus,
  DoorOpen,
  Smile,
  Reply,
  X as XIcon,
  Menu,
  ChevronLeft,
  Bell,
  Users,
  Send,
} from "lucide-react";
import { User, Conversation, Member, Message } from "@/types";
import { api } from "@/services/api";
import { authStorage } from "@/utils/auth";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConv, setCurrentConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);

  const [showNewConv, setShowNewConv] = useState(false);
  const [newConvName, setNewConvName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  const [showAddMember, setShowAddMember] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);

  const [showConvSettings, setShowConvSettings] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  const [showKickModal, setShowKickModal] = useState(false);
  const [kickTarget, setKickTarget] = useState<Member | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [showEmojiPicker, setShowEmojiPicker] = useState<number | null>(null);

  // Mobile states
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && currentConv) {
        setShowSidebar(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [currentConv]);

  // Load user from storage on mount
  useEffect(() => {
    const savedUser = authStorage.getUser();
    if (savedUser) {
      setUser(savedUser);
      loadConversations(savedUser.id);
    }
    setLoading(false);
  }, []);

  const handleAuth = async () => {
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Username and password required");
      return;
    }

    try {
      const data = isSignUp
        ? await api.signup(username.trim(), password)
        : await api.signin(username.trim(), password);

      if (data.error) {
        setError(data.error);
        return;
      }

      setUser(data);
      authStorage.saveUser(data);
      loadConversations(data.id);
      setUsername("");
      setPassword("");
    } catch (err) {
      setError("Connection error");
    }
  };

  const handleLogout = () => {
    setUser(null);
    authStorage.clearUser();
    setConversations([]);
    setCurrentConv(null);
    setMessages([]);
  };

  const loadConversations = async (userId: number) => {
    const data = await api.getConversations(userId);
    setConversations(data);
  };

  const loadAllUsers = async () => {
    const data = await api.getAllUsers();
    setAllUsers(data);
  };

  const createConversation = async () => {
    if (!newConvName.trim() || !user) return;

    const data = await api.createConversation(
      newConvName.trim(),
      user.id,
      selectedMembers,
    );

    setNewConvName("");
    setSelectedMembers([]);
    setShowNewConv(false);
    await loadConversations(user.id);
    selectConversation(data);
  };

  const selectConversation = async (conv: Conversation) => {
    setCurrentConv(conv);
    await loadMessages(conv.id);
    await loadMembers(conv.id);
    setReplyTo(null);

    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const loadMessages = async (convId: number) => {
    const data = await api.getMessages(convId);
    setMessages(data);
  };

  const loadMembers = async (convId: number) => {
    const data = await api.getMembers(convId);
    setMembers(data);
  };

  const refreshCurrentConversation = async () => {
    if (currentConv && user) {
      await loadMembers(currentConv.id);
      await loadConversations(user.id);

      // Update currentConv with latest data
      const updatedConvs = await api.getConversations(user.id);
      const updated = updatedConvs.find(
        (c: Conversation) => c.id === currentConv.id,
      );
      if (updated) {
        setCurrentConv(updated);
      }
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !user || !currentConv) return;

    await api.sendMessage(currentConv.id, user.id, input.trim(), replyTo?.id);

    setInput("");
    setReplyTo(null);
    await loadMessages(currentConv.id);
  };

  const deleteMessage = async (msgId: number) => {
    if (!user) return;
    await api.deleteMessage(msgId, user.id);
    if (currentConv) await loadMessages(currentConv.id);
  };

  const addMember = async (userId: number) => {
    if (!currentConv) return;

    const res = await api.addMember(currentConv.id, userId);
    if (!res.error) {
      await refreshCurrentConversation();
    }
  };

  const leaveConversation = async () => {
    if (!currentConv || !user) return;

    await api.leaveConversation(currentConv.id, user.id);
    setCurrentConv(null);
    await loadConversations(user.id);
    setShowConvSettings(false);

    if (isMobile) {
      setShowSidebar(true);
    }
  };

  const updateConvName = async () => {
    if (!currentConv || !user || !newName.trim()) return;

    await api.updateConversationName(currentConv.id, newName.trim(), user.id);
    setEditingName(false);
    setNewName("");

    await refreshCurrentConversation();
  };

  const initiateKick = async (member: Member) => {
    setKickTarget(member);
    setShowKickModal(true);
  };

  const voteKick = async (vote: boolean) => {
    if (!currentConv || !kickTarget || !user) return;

    const res = await api.voteKick(
      currentConv.id,
      kickTarget.id,
      user.id,
      vote,
    );

    setShowKickModal(false);
    setKickTarget(null);

    if (res.kicked) {
      await refreshCurrentConversation();
      alert(`${kickTarget.username} has been removed from the conversation.`);
    } else {
      alert(
        `Vote recorded. ${Math.ceil(members.length * 0.7)} votes needed to remove member.`,
      );
    }
  };

  const voteDeleteConv = async (vote: boolean) => {
    if (!currentConv || !user) return;

    const res = await api.voteDeleteConversation(currentConv.id, user.id, vote);

    setShowDeleteModal(false);

    if (res.deleted) {
      setCurrentConv(null);
      await loadConversations(user.id);
      alert("Conversation has been deleted.");

      if (isMobile) {
        setShowSidebar(true);
      }
    } else {
      alert(
        `Vote recorded. All ${members.length} members must agree to delete.`,
      );
    }
  };

  const reactToMessage = async (msgId: number, emoji: string) => {
    if (!user) return;
    await api.reactToMessage(msgId, user.id, emoji);
    if (currentConv) await loadMessages(currentConv.id);
    setShowEmojiPicker(null);
  };

  useEffect(() => {
    if (currentConv && user) {
      const interval = setInterval(() => {
        loadMessages(currentConv.id);
        refreshCurrentConversation();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [currentConv, user]);

  // Refresh conversation list periodically
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => loadConversations(user.id), 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Auth Screen
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="p-6 sm:p-8 w-full max-w-md shadow-2xl">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            TFLH Chat
          </h1>
          <p className="text-center text-gray-600 mb-6 text-sm sm:text-base">
            {isSignUp ? "Create your account" : "Welcome back!"}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-300 text-sm">
              {error}
            </div>
          )}

          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mb-3"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAuth()}
            className="mb-4"
          />

          <Button
            onClick={handleAuth}
            className={`w-full mb-3 ${
              isSignUp
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSignUp ? "✨ Create Account" : "🚀 Sign In"}
          </Button>

          <div className="text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              {isSignUp
                ? "Already have an account? Sign In"
                : "Don't have an account? Create one"}
            </button>
          </div>
        </Card>
      </div>
    );
  }

  const emojis = ["👍", "❤️", "😂", "😮", "😢", "🎉"];

  // Main Chat Screen
  return (
    <div className="h-screen flex flex-col md:flex-row bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          isMobile
            ? `fixed inset-0 z-50 bg-white transform transition-transform ${
                showSidebar ? "translate-x-0" : "-translate-x-full"
              }`
            : "w-80 border-r bg-white"
        } flex flex-col`}
      >
        <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="font-bold text-lg">{user.username}</h2>
              <p className="text-sm text-blue-100">Conversations</p>
            </div>
            <div className="flex gap-2">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSidebar(false)}
                  className="text-white hover:bg-white/20"
                >
                  <XIcon size={18} />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-white hover:bg-white/20"
              >
                <LogOut size={18} />
              </Button>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => selectConversation(conv)}
              className={`p-4 cursor-pointer hover:bg-gray-50 border-b transition-colors ${
                currentConv?.id === conv.id
                  ? "bg-blue-50 border-l-4 border-l-blue-600"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {conv.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    <Users size={12} className="inline mr-1" />
                    {conv.member_count} member
                    {conv.member_count !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>

        <div className="p-4 border-t">
          <Button
            onClick={() => {
              setShowNewConv(true);
              loadAllUsers();
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
          >
            <Plus size={18} className="mr-2" />
            New Conversation
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {currentConv ? (
          <>
            {/* Header */}
            <div className="bg-white border-b p-3 sm:p-4 flex justify-between items-center shadow-sm">
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
                    {currentConv.name}
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
                  onClick={() => {
                    setShowAddMember(true);
                    loadAllUsers();
                  }}
                  className="hidden sm:flex"
                >
                  <UserPlus size={16} className="mr-2" />
                  Add
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setShowAddMember(true);
                    loadAllUsers();
                  }}
                  className="sm:hidden"
                >
                  <UserPlus size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowConvSettings(true)}
                >
                  <Edit2 size={16} />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-3 sm:p-4 bg-gray-50">
              <div className="max-w-4xl mx-auto space-y-4">
                {messages.map((msg, index) => (
                  <div key={msg.id} className="group">
                    {/* Reply Context */}
                    {msg.reply_to && (
                      <div
                        className={`mb-2 text-xs p-2 rounded-lg bg-white border-l-4 border-blue-400 shadow-sm ${
                          msg.user_id === user.id
                            ? "ml-auto mr-2"
                            : "ml-2 mr-auto"
                        }`}
                        style={{ maxWidth: "280px" }}
                      >
                        <div className="flex items-center gap-1 mb-1">
                          <Reply size={12} className="text-blue-600" />
                          <span className="font-semibold text-blue-700">
                            {msg.reply_to.username}
                          </span>
                        </div>
                        <div className="text-gray-600 line-clamp-2 text-xs">
                          {msg.reply_to.content}
                        </div>
                      </div>
                    )}

                    {/* Message */}
                    <div
                      className={`flex ${
                        msg.user_id === user.id
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div className="relative max-w-[85%] sm:max-w-xs">
                        <div
                          className={`px-3 sm:px-4 py-2 rounded-2xl shadow-md ${
                            msg.user_id === user.id
                              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none"
                              : "bg-white text-gray-900 rounded-bl-none"
                          }`}
                        >
                          <p className="text-xs opacity-70 mb-1 font-medium">
                            {msg.username}
                          </p>
                          <p className="break-words text-sm sm:text-base">
                            {msg.content}
                          </p>

                          {/* Reactions */}
                          {msg.reactions && msg.reactions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {Object.entries(
                                msg.reactions.reduce((acc: any, r) => {
                                  acc[r.emoji] = acc[r.emoji] || [];
                                  acc[r.emoji].push(r.username);
                                  return acc;
                                }, {}),
                              ).map(([emoji, users]) => (
                                <span
                                  key={emoji}
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    msg.user_id === user.id
                                      ? "bg-white/20"
                                      : "bg-gray-100"
                                  }`}
                                  title={(users as string[]).join(", ")}
                                >
                                  {emoji} {(users as string[]).length}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Message Actions - Fixed positioning and colors */}
                        {(index > 0 || msg.user_id === user.id) && (
                          <div
                            className={`absolute ${
                              msg.user_id === user.id ? "right-0" : "left-0"
                            } -top-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white rounded-lg shadow-lg p-1 border border-gray-200 z-10`}
                          >
                            <button
                              onClick={() => setShowEmojiPicker(msg.id)}
                              className="p-1.5 hover:bg-gray-100 rounded text-gray-700"
                              title="React"
                            >
                              <Smile size={16} />
                            </button>
                            <button
                              onClick={() => setReplyTo(msg)}
                              className="p-1.5 hover:bg-gray-100 rounded text-gray-700"
                              title="Reply"
                            >
                              <Reply size={16} />
                            </button>
                            {msg.user_id === user.id && (
                              <button
                                onClick={() => deleteMessage(msg.id)}
                                className="p-1.5 hover:bg-red-100 text-red-600 rounded"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        )}

                        {/* Emoji Picker */}
                        {showEmojiPicker === msg.id && (
                          <div className="absolute -top-16 left-0 bg-white rounded-lg shadow-xl p-2 flex gap-1 z-20 border border-gray-200">
                            {emojis.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => reactToMessage(msg.id, emoji)}
                                className="text-xl hover:scale-125 transition-transform p-1"
                              >
                                {emoji}
                              </button>
                            ))}
                            <button
                              onClick={() => setShowEmojiPicker(null)}
                              className="ml-2 text-gray-500 hover:text-gray-700"
                            >
                              <XIcon size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messageEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="bg-white border-t p-3 sm:p-4">
              {replyTo && (
                <div className="max-w-4xl mx-auto mb-2 p-2 bg-blue-50 border-l-4 border-blue-500 rounded flex justify-between items-center">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-blue-700 font-medium flex items-center gap-1">
                      <Reply size={12} />
                      Replying to {replyTo.username}
                    </span>
                    <p className="text-sm text-gray-600 truncate">
                      {replyTo.content}
                    </p>
                  </div>
                  <button
                    onClick={() => setReplyTo(null)}
                    className="text-gray-500 hover:text-gray-700 ml-2"
                  >
                    <XIcon size={16} />
                  </button>
                </div>
              )}
              <div className="max-w-4xl mx-auto flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !e.shiftKey && sendMessage()
                  }
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 shrink-0"
                  size={isMobile ? "icon" : "default"}
                >
                  {isMobile ? <Send size={18} /> : "Send"}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-4">
            {isMobile && (
              <Button
                variant="outline"
                onClick={() => setShowSidebar(true)}
                className="mb-4"
              >
                <Menu size={18} className="mr-2" />
                Show Conversations
              </Button>
            )}
            <div className="text-center">
              <div className="text-5xl sm:text-6xl mb-4">💬</div>
              <p className="text-lg sm:text-xl">
                Select a conversation to start chatting
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal
        isOpen={showNewConv}
        onClose={() => {
          setShowNewConv(false);
          setNewConvName("");
          setSelectedMembers([]);
        }}
        title="New Conversation"
      >
        <Input
          placeholder="Conversation name"
          value={newConvName}
          onChange={(e) => setNewConvName(e.target.value)}
          className="mb-4"
        />
        <div className="mb-4">
          <p className="text-sm font-medium mb-2">Select members:</p>
          <div className="max-h-48 sm:max-h-60 overflow-y-auto border rounded p-2">
            {allUsers
              .filter((u) => u.id !== user.id)
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
                          selectedMembers.filter((id) => id !== u.id),
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
          <Button onClick={createConversation} className="flex-1">
            Create
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setShowNewConv(false);
              setNewConvName("");
              setSelectedMembers([]);
            }}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        title="Add Member"
      >
        <div className="max-h-48 sm:max-h-60 overflow-y-auto border rounded p-2">
          {allUsers
            .filter((u) => !members.some((m) => m.id === u.id))
            .map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
              >
                <span className="text-sm sm:text-base">{u.username}</span>
                <Button
                  size="sm"
                  onClick={() => {
                    addMember(u.id);
                    setShowAddMember(false);
                  }}
                >
                  Add
                </Button>
              </div>
            ))}
        </div>
      </Modal>

      <Modal
        isOpen={showConvSettings}
        onClose={() => {
          setShowConvSettings(false);
          setEditingName(false);
          setNewName("");
        }}
        title="Conversation Settings"
      >
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
                <Button size="sm" onClick={updateConvName}>
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
                  {m.id !== user.id && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => initiateKick(m)}
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
              onClick={leaveConversation}
            >
              <DoorOpen size={16} className="mr-2" />
              Leave Conversation
            </Button>
            <Button
              variant="destructive"
              className="w-full justify-start"
              onClick={() => {
                setShowConvSettings(false);
                setShowDeleteModal(true);
              }}
            >
              <Trash2 size={16} className="mr-2" />
              Delete Conversation
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showKickModal}
        onClose={() => {
          setShowKickModal(false);
          setKickTarget(null);
        }}
        title="Vote to Remove Member"
      >
        <div className="space-y-4">
          <p className="text-sm">
            Vote to remove <strong>{kickTarget?.username}</strong> from this
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
              onClick={() => voteKick(true)}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              Vote Yes
            </Button>
            <Button
              variant="outline"
              onClick={() => voteKick(false)}
              className="flex-1"
            >
              Vote No
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Conversation"
      >
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
              onClick={() => voteDeleteConv(true)}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              Vote Yes
            </Button>
            <Button
              variant="outline"
              onClick={() => voteDeleteConv(false)}
              className="flex-1"
            >
              Vote No
            </Button>
          </div>
        </div>
      </Modal>

      {/* Mobile overlay for sidebar */}
      {isMobile && showSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowSidebar(false)}
        />
      )}
    </div>
  );
}

export default App;
