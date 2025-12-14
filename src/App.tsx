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

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const login = async () => {
    if (!username.trim()) return;
    
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.trim() }),
    });
    const data = await res.json();
    setUser(data);
    loadMessages();
  };

  const loadMessages = async () => {
    const res = await fetch(`${API}/messages`);
    const data = await res.json();
    setMessages(data);
  };

  const sendMessage = async () => {
    if (!input.trim() || !user) return;
    
    await fetch(`${API}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id, content: input.trim() }),
    });
    setInput("");
    loadMessages();
  };

  useEffect(() => {
    if (user) {
      const interval = setInterval(loadMessages, 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <Card className="p-8 w-96 shadow-lg">
          <h1 className="text-3xl font-bold mb-6 text-center">TFLH Chat</h1>
          <Input
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            className="mb-4"
          />
          <Button onClick={login} className="w-full">
            Join Chat
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="bg-white border-b p-4 shadow-sm">
        <h1 className="text-xl font-bold">TFLH Chat - {user.username}</h1>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-4xl mx-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-3 flex ${
                msg.username === user.username ? "justify-end" : "justify-start"
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

      <div className="bg-white border-t p-4 shadow-lg">
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
    </div>
  );
}

export default App;
