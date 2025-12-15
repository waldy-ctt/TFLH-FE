import { User } from "@/types";

const USER_STORAGE_KEY = "tflh_user";

export const authStorage = {
  /**
   * Save user to localStorage
   */
  saveUser: (user: User): void => {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      console.error("Failed to save user to localStorage:", error);
    }
  },

  /**
   * Get user from localStorage
   */
  getUser: (): User | null => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (!stored) return null;
      return JSON.parse(stored) as User;
    } catch (error) {
      console.error("Failed to get user from localStorage:", error);
      return null;
    }
  },

  /**
   * Clear user from localStorage
   */
  clearUser: (): void => {
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear user from localStorage:", error);
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return authStorage.getUser() !== null;
  },

  /**
   * Update user data in localStorage
   */
  updateUser: (updates: Partial<User>): void => {
    const currentUser = authStorage.getUser();
    if (!currentUser) return;

    const updatedUser = { ...currentUser, ...updates };
    authStorage.saveUser(updatedUser);
  },
};

/**
 * Check if username is valid
 */
export function isValidUsername(username: string): boolean {
  // Username must be 3-20 characters, alphanumeric and underscore only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

/**
 * Check if password is valid
 */
export function isValidPassword(password: string): boolean {
  // Password must be at least 6 characters
  return password.length >= 6;
}

/**
 * Validate credentials
 */
export function validateCredentials(
  username: string,
  password: string
): { valid: boolean; error?: string } {
  if (!username.trim()) {
    return { valid: false, error: "Username is required" };
  }

  if (!password.trim()) {
    return { valid: false, error: "Password is required" };
  }

  if (!isValidUsername(username)) {
    return {
      valid: false,
      error: "Username must be 3-20 characters (letters, numbers, underscore)",
    };
  }

  if (!isValidPassword(password)) {
    return {
      valid: false,
      error: "Password must be at least 6 characters",
    };
  }

  return { valid: true };
}
