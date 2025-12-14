const API = "http://localhost:3000/api";

export const api = {
  // Auth
  signup: async (username: string, password: string) => {
    const res = await fetch(`${API}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    return res.json();
  },

  signin: async (username: string, password: string) => {
    const res = await fetch(`${API}/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    return res.json();
  },

  // Users
  getAllUsers: async () => {
    const res = await fetch(`${API}/users`);
    return res.json();
  },

  searchUsers: async (query: string) => {
    const res = await fetch(`${API}/users/search?q=${query}`);
    return res.json();
  },

  // Conversations
  getConversations: async (userId: number) => {
    const res = await fetch(`${API}/conversations?user_id=${userId}`);
    return res.json();
  },

  createConversation: async (name: string, createdBy: number, memberIds: number[]) => {
    const res = await fetch(`${API}/conversations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, created_by: createdBy, member_ids: memberIds }),
    });
    return res.json();
  },

  updateConversationName: async (convId: number, name: string, userId: number) => {
    const res = await fetch(`${API}/conversations/${convId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, user_id: userId }),
    });
    return res.json();
  },

  // Members
  getMembers: async (convId: number) => {
    const res = await fetch(`${API}/conversations/${convId}/members`);
    return res.json();
  },

  addMember: async (convId: number, userId: number) => {
    const res = await fetch(`${API}/conversations/${convId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });
    return res.json();
  },

  leaveConversation: async (convId: number, userId: number) => {
    const res = await fetch(`${API}/conversations/${convId}/leave`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });
    return res.json();
  },

  // Kick votes
  voteKick: async (convId: number, targetUserId: number, voterUserId: number, vote: boolean) => {
    const res = await fetch(`${API}/conversations/${convId}/kick`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target_user_id: targetUserId, voter_user_id: voterUserId, vote }),
    });
    return res.json();
  },

  getKickVotes: async (convId: number, targetUserId: number) => {
    const res = await fetch(`${API}/conversations/${convId}/kick/${targetUserId}`);
    return res.json();
  },

  // Delete conversation votes
  voteDeleteConversation: async (convId: number, voterUserId: number, vote: boolean) => {
    const res = await fetch(`${API}/conversations/${convId}/delete-vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voter_user_id: voterUserId, vote }),
    });
    return res.json();
  },

  getDeleteVotes: async (convId: number) => {
    const res = await fetch(`${API}/conversations/${convId}/delete-vote`);
    return res.json();
  },

  // Messages
  getMessages: async (convId: number) => {
    const res = await fetch(`${API}/conversations/${convId}/messages`);
    return res.json();
  },

  sendMessage: async (convId: number, userId: number, content: string, replyToId?: number) => {
    const res = await fetch(`${API}/conversations/${convId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, content, reply_to_id: replyToId }),
    });
    return res.json();
  },

  deleteMessage: async (msgId: number, userId: number) => {
    const res = await fetch(`${API}/messages/${msgId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });
    return res.json();
  },

  reactToMessage: async (msgId: number, userId: number, emoji: string) => {
    const res = await fetch(`${API}/messages/${msgId}/react`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, emoji }),
    });
    return res.json();
  },
};
