import { User } from "@/types";

const USER_KEY = "tflh_user";

export const authStorage = {
  saveUser: (user: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser: (): User | null => {
    const stored = localStorage.getItem(USER_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  clearUser: () => {
    localStorage.removeItem(USER_KEY);
  },
};
