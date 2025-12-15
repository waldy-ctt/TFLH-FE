// const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const API_BASE_URL = "https://yaca-chat.duckdns.org/api";

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
  // Auth APIs
  signup: async (username: string, password: string) => {
    return fetchAPI(`${API_BASE_URL}/signup`, {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  },

  signin: async (username: string, password: string) => {
    return fetchAPI(`${API_BASE_URL}/signin`, {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  },

  // ... rest of your API methods (keep them the same, just use API_BASE_URL)
  
  getAllUsers: async () => {
    return fetchAPI(`${API_BASE_URL}/users`);
  },

  searchUsers: async (query: string) => {
    return fetchAPI(`${API_BASE_URL}/users/search?q=${encodeURIComponent(query)}`);
  },

  getConversations: async (userId: number) => {
    return fetchAPI(`${API_BASE_URL}/conversations?user_id=${userId}`);
  },

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

  getMembers: async (convId: number) => {
    return fetchAPI(`${API_BASE_URL}/conversations/${convId}/members`);
  },

  addMember: async (convId: number, userId: number, addedById?: number) => {
    return fetchAPI(`${API_BASE_URL}/conversations/${convId}/members`, {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        added_by_id: addedById,
      }),
    });
  },

  leaveConversation: async (convId: number, userId: number) => {
    return fetchAPI(`${API_BASE_URL}/conversations/${convId}/leave`, {
      method: "POST",
      body: JSON.stringify({ user_id: userId }),
    });
  },

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

  getKickVotes: async (convId: number, targetUserId: number) => {
    return fetchAPI(
      `${API_BASE_URL}/conversations/${convId}/kick/${targetUserId}`
    );
  },

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

  getDeleteVotes: async (convId: number) => {
    return fetchAPI(`${API_BASE_URL}/conversations/${convId}/delete-vote`);
  },

  getMessages: async (convId: number) => {
    return fetchAPI(`${API_BASE_URL}/conversations/${convId}/messages`);
  },

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

  deleteMessage: async (msgId: number, userId: number) => {
    return fetchAPI(`${API_BASE_URL}/messages/${msgId}`, {
      method: "DELETE",
      body: JSON.stringify({ user_id: userId }),
    });
  },

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

export type API = typeof api;
