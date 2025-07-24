export interface User {
  id: string;
  name: string;
  isAdmin?: boolean;
  country?: string;
  industry?: string;
}

export interface AppInfo {
  id:string;
  nameKey: string;
  descriptionKey: string;
  icon: React.ComponentType<{ className?: string }>;
  token: string;
  avatarUrl: string;
  url?: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: number;
  imageUrl?: string;
  imageFile?: File;
}

export interface Bot {
  id: string;
  name: string;
  avatarUrl: string;
  systemInstruction: string;
  token: string;
}

export interface DifyStreamResponse {
  event: string;
  answer?: string;
  conversation_id?: string;
}

export interface DifyMessage {
  id: string;
  conversation_id: string;
  query: string;
  answer: string;
  created_at: number;
}

export interface DifyHistoryResponse {
  data: DifyMessage[];
  has_more: boolean;
  limit: number;
}