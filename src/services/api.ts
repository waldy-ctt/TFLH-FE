const API_BASE_URL = "http://localhost:3000/api";

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

export const api = {
  // ============================================
  // Auth APIs
  // ============================================
  
  /**
   * Create a new user account
   */
  signup: async (username: string, password: string) => {
    return fetchAPI(`${API_BASE_URL}/signup`, {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  },

  /**
   * Sign in with existing credentials
   */
  signin: async (username: string, password: string) => {
    return fetchAPI(`${API_BASE_URL}/signin`, {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  },

  // ============================================
  // User APIs
  // ============================================

  /**
   * Get all users in the system
   */
  getAllUsers: async () => {
    return fetchAPI(`${API_BASE_URL}/users`);
  },

  /**
   * Search users by username
   */
  searchUsers: async (query: string) => {
    return fetchAPI(`${API_BASE_URL}/users/search?q=${encodeURIComponent(query)}`);
  },

  // ============================================
  // Conversation APIs
  // ============================================

  /**
   * Get all conversations for a user
   */
  getConversations: async (userId: number) => {
    return fetchAPI(`${API_BASE_URL}/conversations?user_id=${userId}`);
  },

  /**
   * Create a new conversation
   */
  createConversation: async (
    name: string,
    createdBy: number,
    memberIds: number[]
  ) => {
    return fetchAPI(`${API_BASE_URL}/conversations`, {
      method: "POST",
      body: JSON.stringify({
        name,
        created_by: createdBy,
        member_ids: memberIds,
      }),
    });
  },

  /**
   * Update conversation name
   */
  updateConversationName: async (
    convId: number,
    name: string,
    userId: number
  ) => {
    return fetchAPI(`${API_BASE_URL}/conversations/${convId}`, {
      method: "PUT",
      body: JSON.stringify({ name, user_id: userId }),
    });
  },

  // ============================================
  // Member APIs
  // ============================================

  /**
   * Get all members in a conversation
   */
  getMembers: async (convId: number) => {
    return fetchAPI(`${API_BASE_URL}/conversations/${convId}/members`);
  },

  /**
   * Add a member to a conversation
   */
  addMember: async (convId: number, userId: number, addedById?: number) => {
    return fetchAPI(`${API_BASE_URL}/conversations/${convId}/members`, {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        added_by_id: addedById,
      }),
    });
  },

  /**
   * Leave a conversation
   */
  leaveConversation: async (convId: number, userId: number) => {
    return fetchAPI(`${API_BASE_URL}/conversations/${convId}/leave`, {
      method: "POST",
      body: JSON.stringify({ user_id: userId }),
    });
  },

  // ============================================
  // Vote APIs
  // ============================================

  /**
   * Vote to kick a member from conversation
   */
  voteKick: async (
    convId: number,
    targetUserId: number,
    voterUserId: number,
    vote: boolean
  ) => {
    return fetchAPI(`${API_BASE_URL}/conversations/${convId}/kick`, {
      method: "POST",
      body: JSON.stringify({
        target_user_id: targetUserId,
        voter_user_id: voterUserId,
        vote,
      }),
    });
  },

  /**
   * Get kick vote status for a member
   */
  getKickVotes: async (convId: number, targetUserId: number) => {
    return fetchAPI(
      `${API_BASE_URL}/conversations/${convId}/kick/${targetUserId}`
    );
  },

  /**
   * Vote to delete a conversation
   */
  voteDeleteConversation: async (
    convId: number,
    voterUserId: number,
    vote: boolean
  ) => {
    return fetchAPI(`${API_BASE_URL}/conversations/${convId}/delete-vote`, {
      method: "POST",
      body: JSON.stringify({
        voter_user_id: voterUserId,
        vote,
      }),
    });
  },

  /**
   * Get delete vote status for a conversation
   */
  getDeleteVotes: async (convId: number) => {
    return fetchAPI(`${API_BASE_URL}/conversations/${convId}/delete-vote`);
  },

  // ============================================
  // Message APIs
  // ============================================

  /**
   * Get all messages in a conversation
   */
  getMessages: async (convId: number) => {
    return fetchAPI(`${API_BASE_URL}/conversations/${convId}/messages`);
  },

  /**
   * Send a message to a conversation
   */
  sendMessage: async (
    convId: number,
    userId: number,
    content: string,
    replyToId?: number
  ) => {
    return fetchAPI(`${API_BASE_URL}/conversations/${convId}/messages`, {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        content,
        reply_to_id: replyToId,
      }),
    });
  },

  /**
   * Delete a message
   */
  deleteMessage: async (msgId: number, userId: number) => {
    return fetchAPI(`${API_BASE_URL}/messages/${msgId}`, {
      method: "DELETE",
      body: JSON.stringify({ user_id: userId }),
    });
  },

  /**
   * Add or remove a reaction to a message
   */
  reactToMessage: async (msgId: number, userId: number, emoji: string) => {
    return fetchAPI(`${API_BASE_URL}/messages/${msgId}/react`, {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        emoji,
      }),
    });
  },
};

// Export type for the API object
export type API = typeof api;
