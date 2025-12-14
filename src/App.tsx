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

  const scrollRef = useRef<HTMLDivElement>(null);

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
    loadConversations(user.id);
    selectConversation(data);
  };

  const selectConversation = async (conv: Conversation) => {
    setCurrentConv(conv);
    loadMessages(conv.id);
    loadMembers(conv.id);
    setReplyTo(null);
  };

  const loadMessages = async (convId: number) => {
    const data = await api.getMessages(convId);
    setMessages(data);
  };

  const loadMembers = async (convId: number) => {
    const data = await api.getMembers(convId);
    setMembers(data);
  };

  const sendMessage = async () => {
    if (!input.trim() || !user || !currentConv) return;

    await api.sendMessage(currentConv.id, user.id, input.trim(), replyTo?.id);

    setInput("");
    setReplyTo(null);
    loadMessages(currentConv.id);
  };

  const deleteMessage = async (msgId: number) => {
    if (!user) return;
    await api.deleteMessage(msgId, user.id);
    if (currentConv) loadMessages(currentConv.id);
  };

  const addMember = async (userId: number) => {
    if (!currentConv) return;

    const res = await api.addMember(currentConv.id, userId);
    if (!res.error) {
      loadMembers(currentConv.id);
      if (user) loadConversations(user.id);
    }
  };

  const leaveConversation = async () => {
    if (!currentConv || !user) return;

    await api.leaveConversation(currentConv.id, user.id);
    setCurrentConv(null);
    loadConversations(user.id);
    setShowConvSettings(false);
  };

  const updateConvName = async () => {
    if (!currentConv || !user || !newName.trim()) return;

    await api.updateConversationName(currentConv.id, newName.trim(), user.id);
    setEditingName(false);
    setNewName("");
    if (user) loadConversations(user.id);
    selectConversation({ ...currentConv, name: newName.trim() });
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

    if (res.kicked) {
      loadMembers(currentConv.id);
      if (user) loadConversations(user.id);
      setShowKickModal(false);
      setKickTarget(null);
    } else {
      alert(`Vote recorded. ${Math.ceil(members.length * 0.7)} votes needed.`);
      setShowKickModal(false);
      setKickTarget(null);
    }
  };

  const voteDeleteConv = async (vote: boolean) => {
    if (!currentConv || !user) return;

    const res = await api.voteDeleteConversation(currentConv.id, user.id, vote);

    if (res.deleted) {
      setCurrentConv(null);
      loadConversations(user.id);
      setShowDeleteModal(false);
    } else {
      alert(`Vote recorded. All ${members.length} members must agree.`);
      setShowDeleteModal(false);
    }
  };

  const reactToMessage = async (msgId: number, emoji: string) => {
    if (!user) return;
    await api.reactToMessage(msgId, user.id, emoji);
    if (currentConv) loadMessages(currentConv.id);
    setShowEmojiPicker(null);
  };

  useEffect(() => {
    if (currentConv && user) {
      const interval = setInterval(() => loadMessages(currentConv.id), 2000);
      return () => clearInterval(interval);
    }
  }, [currentConv, user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
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
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="p-8 w-96 shadow-2xl">
          <h1 className="text-4xl font-bold mb-2 text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            TFLH Chat
          </h1>
          <p className="text-center text-gray-600 mb-6">
            {isSignUp ? "Create your account" : "Welcome back!"}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-300">
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
            {isSignUp ? "Create Account" : "Sign In"}
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

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r flex flex-col">
        <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-lg">{user.username}</h2>
              <p className="text-sm text-blue-100">Conversations</p>
            </div>
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
              <p className="font-semibold text-gray-900">{conv.name}</p>
              <p className="text-xs text-gray-500">
                {conv.member_count} member{conv.member_count !== 1 ? "s" : ""}
              </p>
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
      <div className="flex-1 flex flex-col">
        {currentConv ? (
          <>
            <div className="bg-white border-b p-4 flex justify-between items-center shadow-sm">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {currentConv.name}
                </h1>
                <p className="text-sm text-gray-500">
                  {members.length} member{members.length !== 1 ? "s" : ""}:{" "}
                  {members.map((m) => m.username).join(", ")}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowAddMember(true);
                    loadAllUsers();
                  }}
                >
                  <UserPlus size={16} className="mr-2" />
                  Add Member
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowConvSettings(true)}
                >
                  <Edit2 size={16} className="mr-2" />
                  Settings
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4 bg-gray-50">
              <div className="max-w-4xl mx-auto">
                {messages.map((msg) => (
                  <div key={msg.id} className="mb-4">
                    {msg.reply_to_id && (
                      <div className="ml-12 mb-1 text-xs text-gray-500 italic">
                        Replying to message
                      </div>
                    )}
                    <div
                      className={`flex ${
                        msg.user_id === user.id
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg shadow-md relative group ${
                          msg.user_id === user.id
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                            : "bg-white text-gray-900"
                        }`}
                      >
                        <p className="text-xs opacity-70 mb-1 font-medium">
                          {msg.username}
                        </p>
                        <p className="break-words">{msg.content}</p>

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
                                className="text-xs px-2 py-1 bg-white/20 rounded-full"
                                title={(users as string[]).join(", ")}
                              >
                                {emoji} {(users as string[]).length}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Message Actions */}
                        <div className="absolute -top-8 right-0 hidden group-hover:flex gap-1 bg-white rounded-lg shadow-lg p-1">
                          <button
                            onClick={() => setShowEmojiPicker(msg.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="React"
                          >
                            <Smile size={16} />
                          </button>
                          <button
                            onClick={() => setReplyTo(msg)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Reply"
                          >
                            <Reply size={16} />
                          </button>
                          {msg.user_id === user.id && (
                            <button
                              onClick={() => deleteMessage(msg.id)}
                              className="p-1 hover:bg-red-100 text-red-600 rounded"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>

                        {/* Emoji Picker */}
                        {showEmojiPicker === msg.id && (
                          <div className="absolute -top-12 left-0 bg-white rounded-lg shadow-lg p-2 flex gap-1 z-10">
                            {emojis.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => reactToMessage(msg.id, emoji)}
                                className="text-xl hover:scale-125 transition-transform"
                              >
                                {emoji}
                              </button>
                            ))}
                            <button
                              onClick={() => setShowEmojiPicker(null)}
                              className="ml-2 text-gray-500"
                            >
                              <XIcon size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            <div className="bg-white border-t p-4">
              {replyTo && (
                <div className="max-w-4xl mx-auto mb-2 p-2 bg-gray-100 rounded flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Replying to <strong>{replyTo.username}</strong>:{" "}
                    {replyTo.content.substring(0, 50)}...
                  </span>
                  <button onClick={() => setReplyTo(null)}>
                    <XIcon size={16} />
                  </button>
                </div>
              )}
              <div className="max-w-4xl mx-auto flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600"
                >
                  Send
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-xl">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
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
          <div className="max-h-60 overflow-y-auto border rounded p-2">
            {allUsers
              .filter((u) => u.id !== user.id)
              .map((u) => (
                <label
                  key={u.id}
                  className="flex items-center p-2 hover:bg-gray-50 cursor-pointer"
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

      {/* Add Member Modal */}
      <Modal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        title="Add Member"
      >
        <div className="max-h-60 overflow-y-auto border rounded p-2">
          {allUsers
            .filter((u) => !members.some((m) => m.id === u.id))
            .map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-2 hover:bg-gray-50"
              >
                <span>{u.username}</span>
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

      {/* Conversation Settings Modal */}
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
          {/* Rename */}
          <div>
            <p className="text-sm font-medium mb-2">Conversation Name</p>
            {editingName ? (
              <div className="flex gap-2">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="New name"
                />
                <Button size="sm" onClick={updateConvName}>
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingName(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span>{currentConv?.name}</span>
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

          {/* Members */}
          <div>
            <p className="text-sm font-medium mb-2">Members</p>
            <div className="max-h-40 overflow-y-auto border rounded p-2">
              {members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50"
                >
                  <span>{m.username}</span>
                  {m.id !== user.id && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => initiateKick(m)}
                    >
                      <UserMinus size={14} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={leaveConversation}
            >
              <DoorOpen size={16} className="mr-2" />
              Leave Conversation
            </Button>
            <Button
              variant="destructive"
              className="w-full"
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

      {/* Kick Vote Modal */}
      <Modal
        isOpen={showKickModal}
        onClose={() => {
          setShowKickModal(false);
          setKickTarget(null);
        }}
        title="Vote to Kick Member"
      >
        <p className="mb-4">
          Vote to kick <strong>{kickTarget?.username}</strong>? 70% of members
          must agree.
        </p>
        <div className="flex gap-2">
          <Button onClick={() => voteKick(true)} className="flex-1 bg-red-600">
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
      </Modal>

      {/* Delete Conversation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Conversation"
      >
        <p className="mb-4">
          Vote to delete <strong>{currentConv?.name}</strong>? All members must
          agree to delete.
        </p>
        <div className="flex gap-2">
          <Button
            onClick={() => voteDeleteConv(true)}
            className="flex-1 bg-red-600"
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
      </Modal>
    </div>
  );
}

export default App;
