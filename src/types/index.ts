export interface User {
  id: number;
  username: string;
  created_at?: string;
}

export interface Conversation {
  id: number;
  name: string;
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
  username: string;
  user_id: number;
  content: string;
  created_at: string;
  reply_to_id?: number;
  reactions: Reaction[];
}

export interface KickVote {
  id: number;
  voter_user_id: number;
  username: string;
  vote: boolean;
}

export interface DeleteVote {
  id: number;
  voter_user_id: number;
  username: string;
  vote: boolean;
}
