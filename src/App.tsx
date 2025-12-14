import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const API = "http://localhost:3000/api";

interface Message {
  id: number;
  username: string;
  content: string;
  created_at: string;
}

interface User {
  id: number;
  username: string;
}

interface Conversation {
  id: number;
  name: string;
  creator_name: string;
  member_count: number;
}

interface Member {
  id: number;
  username: string;
  joined_at: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConv, setCurrentConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const [showNewConv, setShowNewConv] = useState(false);
  const [newConvName, setNewConvName] = useState("");

  const [showAddMember, setShowAddMember] = useState(false);
  const [searchUsername, setSearchUsername] = useState("");
  const [members, setMembers] = useState<Member[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);

  const handleAuth = async () => {
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Username and password required");
      return;
    }

    const endpoint = isSignUp ? "/signup" : "/signin";
    try {
      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Authentication failed");
        return;
      }

      setUser(data);
      loadConversations(data.id);
    } catch (err) {
      setError("Connection error");
    }
  };

  const loadConversations = async (userId: number) => {
    const res = await fetch(`${API}/conversations?user_id=${userId}`);
    const data = await res.json();
    setConversations(data);
  };

  const createConversation = async () => {
    if (!newConvName.trim() || !user) return;

    const res = await fetch(`${API}/conversations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newConvName.trim(), created_by: user.id }),
    });

    const data = await res.json();
    setNewConvName("");
    setShowNewConv(false);
    loadConversations(user.id);
    selectConversation(data);
  };

  const selectConversation = async (conv: Conversation) => {
    setCurrentConv(conv);
    loadMessages(conv.id);
    loadMembers(conv.id);
  };

  const loadMessages = async (convId: number) => {
    const res = await fetch(`${API}/conversations/${convId}/messages`);
    const data = await res.json();
    setMessages(data);
  };

  const loadMembers = async (convId: number) => {
    const res = await fetch(`${API}/conversations/${convId}/members`);
    const data = await res.json();
    setMembers(data);
  };

  const sendMessage = async () => {
    if (!input.trim() || !user || !currentConv) return;

    await fetch(`${API}/conversations/${currentConv.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id, content: input.trim() }),
    });

    setInput("");
    loadMessages(currentConv.id);
  };

  const addMember = async () => {
    if (!searchUsername.trim() || !currentConv) return;

    const res = await fetch(`${API}/conversations/${currentConv.id}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: searchUsername.trim() }),
    });

    if (res.ok) {
      setSearchUsername("");
      setShowAddMember(false);
      loadMembers(currentConv.id);
      if (user) loadConversations(user.id);
    }
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

  // Auth Screen
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <Card className="p-8 w-96 shadow-lg">
          <h1 className="text-3xl font-bold mb-6 text-center">TFLH Chat</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
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

          <Button onClick={handleAuth} className="w-full mb-3">
            {isSignUp ? "Sign Up" : "Sign In"}
          </Button>

          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
            className="w-full text-sm text-blue-600 hover:underline"
          >
            {isSignUp
              ? "Already have an account? Sign In"
              : "Don't have an account? Sign Up"}
          </button>
        </Card>
      </div>
    );
  }

  // Main Chat Screen
  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-bold text-lg">{user.username}</h2>
          <p className="text-sm text-gray-500">Conversations</p>
        </div>

        <ScrollArea className="flex-1">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => selectConversation(conv)}
              className={`p-4 cursor-pointer hover:bg-gray-50 border-b ${
                currentConv?.id === conv.id ? "bg-blue-50" : ""
              }`}
            >
              <p className="font-semibold">{conv.name}</p>
              <p className="text-xs text-gray-500">
                {conv.member_count} member{conv.member_count !== 1 ? "s" : ""}
              </p>
            </div>
          ))}
        </ScrollArea>

        <div className="p-4 border-t">
          <Button onClick={() => setShowNewConv(true)} className="w-full">
            + New Conversation
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentConv ? (
          <>
            <div className="bg-white border-b p-4 flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold">{currentConv.name}</h1>
                <p className="text-sm text-gray-500">
                  {members.length} member{members.length !== 1 ? "s" : ""}:{" "}
                  {members.map((m) => m.username).join(", ")}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddMember(true)}
              >
                + Add Member
              </Button>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="max-w-4xl mx-auto">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`mb-3 flex ${
                      msg.username === user.username
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg shadow ${
                        msg.username === user.username
                          ? "bg-blue-500 text-white"
                          : "bg-white"
                      }`}
                    >
                      <p className="text-xs opacity-70 mb-1">{msg.username}</p>
                      <p className="break-words">{msg.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            <div className="bg-white border-t p-4">
              <div className="max-w-4xl mx-auto flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  className="flex-1"
                />
                <Button onClick={sendMessage}>Send</Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a conversation to start chatting
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      {showNewConv && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <Card className="p-6 w-96">
            <h2 className="text-xl font-bold mb-4">New Conversation</h2>
            <Input
              placeholder="Conversation name"
              value={newConvName}
              onChange={(e) => setNewConvName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createConversation()}
              className="mb-4"
            />
            <div className="flex gap-2">
              <Button onClick={createConversation} className="flex-1">
                Create
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewConv(false);
                  setNewConvName("");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <Card className="p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Add Member</h2>
            <Input
              placeholder="Enter username"
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addMember()}
              className="mb-4"
            />
            <div className="flex gap-2">
              <Button onClick={addMember} className="flex-1">
                Add
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddMember(false);
                  setSearchUsername("");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default App;
