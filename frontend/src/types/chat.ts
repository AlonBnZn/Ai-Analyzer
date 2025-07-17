// src/types/chat.ts
export interface ChatMessage {
  id: string;
  message: string;
  timestamp: string;
  type: "user" | "assistant";
}

export interface ChatResponse {
  message: string;
  type: "text" | "table" | "chart" | "error";
  data?: any;
  query?: string;
  timestamp: string;
}

export interface SendChatMessageRequest {
  message: string;
  sessionId?: string;
}

export interface SendChatMessageResponse {
  success: boolean;
  data?: ChatResponse;
  error?: string;
}
