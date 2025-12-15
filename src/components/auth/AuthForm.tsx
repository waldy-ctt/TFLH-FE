import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AuthFormProps {
  isSignUp: boolean;
  onSubmit: (username: string, password: string) => void;
  error: string;
  loading: boolean;
}

export default function AuthForm({ 
  isSignUp, 
  onSubmit, 
  error, 
  loading 
}: AuthFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    onSubmit(username, password);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleSubmit();
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-300 text-sm">
          {error}
        </div>
      )}

      <Input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        onKeyDown={handleKeyPress}
        className="mb-3"
        disabled={loading}
        autoFocus
      />
      
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={handleKeyPress}
        className="mb-4"
        disabled={loading}
      />

      <Button
        onClick={handleSubmit}
        className={`w-full ${
          isSignUp
            ? "bg-green-600 hover:bg-green-700"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
        disabled={loading}
      >
        {loading ? "Loading..." : isSignUp ? "✨ Create Account" : "🚀 Sign In"}
      </Button>
    </div>
  );
}
