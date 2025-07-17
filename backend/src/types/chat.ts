export interface ChatMessage {
  id: string;
  message: string;
  response: string;
  timestamp: Date;
  type: "text" | "table" | "chart";
  metadata?: {
    queryType: string;
    dataPoints: number;
    executionTime: number;
  };
}

export interface Conversation {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
}

export interface ChatResponse {
  success: boolean;
  response: string;
  type: "text" | "table" | "chart";
  data?: any;
  chartType?: "line" | "bar" | "pie";
  conversationId: string;
  suggestions?: string[];
  metadata?: {
    queryType: string;
    dataPoints: number;
    executionTime: number;
  };
  error?: string;
}
