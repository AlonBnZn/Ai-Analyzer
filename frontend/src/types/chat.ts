// Fixed Chat Types - frontend/src/types/chat.ts

export interface ChatMessage {
  id: string;
  message: string;
  timestamp: string;
  type: "user" | "assistant";
}

export interface ChatResponse {
  message: string;
  type: "text" | "table" | "chart" | "error";
  data?: Record<string, unknown>;
  query?: string;
  timestamp: string;
  metadata?: {
    queryType?: string;
    dataPoints?: number;
    executionTime?: number;
    chartType?: "line" | "bar" | "pie";
  };
}

export interface SendChatMessageRequest {
  message: string;
  sessionId?: string;
  conversationId?: string; // Alternative naming convention
}

export interface SendChatMessageResponse {
  success: boolean;
  response?: string; // For simple text responses
  type?: "text" | "table" | "chart" | "error";
  data?: ChatResponse; // For structured responses
  error?: string;
  conversationId?: string;
  metadata?: {
    queryType?: string;
    dataPoints?: number;
    executionTime?: number;
  };
}

// Additional types for structured data responses
export interface TableData {
  columns: string[];
  rows: unknown[][];
}

export interface ChartData {
  chartType: "line" | "bar" | "pie";
  data: Record<string, unknown>[];
  xAxis?: string;
  yAxis?: string;
  title?: string;
}

// Message types for the chat component
export interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  responseType?: "text" | "chart" | "table" | "error";
  data?: Record<string, unknown>;
}

// Connection status
export type ConnectionStatus = "connected" | "disconnected" | "testing";

// Conversation management
export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface ConversationSummary {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
}
