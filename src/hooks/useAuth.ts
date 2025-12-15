import { useState } from "react";
import { api } from "@/services/api";
import { authStorage } from "@/utils/auth";
import { useAppContext } from "@/contexts/AppContext";

export function useAuth() {
  const { setUser } = useAppContext();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const signUp = async (username: string, password: string) => {
    setError("");
    setLoading(true);

    if (!username.trim() || !password.trim()) {
      setError("Username and password required");
      setLoading(false);
      return false;
    }

    try {
      const data = await api.signup(username.trim(), password);
      
      if (data.error) {
        setError(data.error);
        setLoading(false);
        return false;
      }

      setUser(data);
      authStorage.saveUser(data);
      setLoading(false);
      return true;
    } catch (err) {
      setError("Connection error");
      setLoading(false);
      return false;
    }
  };

  const signIn = async (username: string, password: string) => {
    setError("");
    setLoading(true);

    if (!username.trim() || !password.trim()) {
      setError("Username and password required");
      setLoading(false);
      return false;
    }

    try {
      const data = await api.signin(username.trim(), password);
      
      if (data.error) {
        setError(data.error);
        setLoading(false);
        return false;
      }

      setUser(data);
      authStorage.saveUser(data);
      setLoading(false);
      return true;
    } catch (err) {
      setError("Connection error");
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    authStorage.clearUser();
  };

  return { signUp, signIn, logout, error, loading };
}
