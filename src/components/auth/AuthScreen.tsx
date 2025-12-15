import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { signUp, signIn, error, loading } = useAuth();

  const handleSubmit = async () => {
    const success = isSignUp 
      ? await signUp(username, password)
      : await signIn(username, password);
    
    if (success) {
      setUsername("");
      setPassword("");
    }
  };

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
          disabled={loading}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="mb-4"
          disabled={loading}
        />

        <Button
          onClick={handleSubmit}
          className={`w-full mb-3 ${
            isSignUp
              ? "bg-green-600 hover:bg-green-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
          disabled={loading}
        >
          {loading ? "..." : isSignUp ? "✨ Create Account" : "🚀 Sign In"}
        </Button>

        <div className="text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
            }}
            className="text-sm text-blue-600 hover:underline font-medium"
            disabled={loading}
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
