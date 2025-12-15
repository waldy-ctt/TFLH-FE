
export interface User {
  id: number;
  username: string;
  password?: string;
  created_at?: string;
}

export interface Conversation {
  id: number;
  name: string;
  created_by: number;
  creator_name: string;
  member_count: number;
  created_at: string;
}

export interface Member {
  id: number;
  username: string;
  joined_at: string;
}

export interface Reaction {
  user_id: number;
  username: string;
  emoji: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  user_id: number | null;
  username: string;
  content: string;
  reply_to_id?: number;
  reply_to?: {
    id: number;
    content: string;
    username: string;
  };
  is_system?: boolean;
  reactions: Reaction[];
  created_at: string;
}

export interface KickVote {
  id: number;
  conversation_id: number;
  target_user_id: number;
  voter_user_id: number;
  username: string;
  vote: boolean;
  created_at: string;
}

export interface DeleteVote {
  id: number;
  conversation_id: number;
  voter_user_id: number;
  username: string;
  vote: boolean;
  created_at: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}
