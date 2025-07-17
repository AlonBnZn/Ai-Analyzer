// src/components/ChatAssistant.tsx
import { useState } from "react";
import {
  PaperAirplaneIcon,
  SparklesIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";

const ChatAssistant = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<
    Array<{
      id: string;
      type: "user" | "assistant";
      content: string;
      timestamp: Date;
    }>
  >([
    {
      id: "1",
      type: "assistant",
      content:
        'Hello! I\'m your AI assistant for analyzing job indexing data. You can ask me questions like:\n\n• "What\'s the average success rate for Deal1 last week?"\n• "Show me clients with processing issues"\n• "Which country has the highest job volume?"\n\nHow can I help you today?',
      timestamp: new Date(),
    },
  ]);

  const suggestedQuestions = [
    "What's the overall success rate this month?",
    "Which client has the best performance?",
    "Show me processing trends over time",
    "What are the most common failure reasons?",
    "Compare performance by country",
  ];

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: "user" as const,
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant" as const,
        content: `I understand you're asking about: "${message}". This is a placeholder response. The actual AI assistant will analyze your data and provide insights, charts, or tables based on your query.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);
  };

  const handleSuggestedQuestion = (question: string) => {
    setMessage(question);
  };

  return (
    <div className="flex h-[700px] flex-col rounded-lg bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center space-x-3 border-b border-gray-200 p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
          <SparklesIcon className="h-6 w-6 text-primary-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            AI Data Assistant
          </h2>
          <p className="text-sm text-gray-600">
            Ask questions about your indexing data
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-lg rounded-lg px-4 py-3 ${
                  msg.type === "user"
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                <div
                  className={`mt-1 text-xs ${
                    msg.type === "user" ? "text-primary-100" : "text-gray-500"
                  }`}
                >
                  {msg.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Questions */}
      {messages.length <= 1 && (
        <div className="border-t border-gray-200 p-4">
          <div className="mb-3 flex items-center space-x-2 text-sm text-gray-600">
            <LightBulbIcon className="h-4 w-4" />
            <span>Suggested questions:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedQuestion(question)}
                className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-200"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-3">
          <div className="flex-1">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask me anything about your indexing data..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 disabled:opacity-50"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;
