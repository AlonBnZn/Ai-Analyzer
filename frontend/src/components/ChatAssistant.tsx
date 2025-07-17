// Dark Theme ChatAssistant.tsx
import { useState } from "react";
import {
  PaperAirplaneIcon,
  SparklesIcon,
  LightBulbIcon,
  UserCircleIcon,
  ChartBarIcon,
  TableCellsIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const ChatAssistant = () => {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<
    Array<{
      id: string;
      type: "user" | "assistant";
      content: string;
      timestamp: Date;
      responseType?: "text" | "chart" | "table";
    }>
  >([
    {
      id: "1",
      type: "assistant",
      content:
        'Hello! I\'m your AI assistant for analyzing job indexing data. You can ask me questions like:\n\n• "What\'s the average success rate for Deal1 last week?"\n• "Show me clients with processing issues"\n• "Which country has the highest job volume?"\n• "Create a chart showing trends over time"\n\nHow can I help you today?',
      timestamp: new Date(),
      responseType: "text",
    },
  ]);

  const suggestedQuestions = [
    "What's the overall success rate this month?",
    "Which client has the best performance?",
    "Show me processing trends over time",
    "What are the most common failure reasons?",
    "Compare performance by country",
    "Create a dashboard for top metrics",
  ];

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      type: "user" as const,
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const responses = [
        {
          content: `Based on your query about "${userMessage.content}", here's what I found:\n\n📊 **Analysis Results:**\n• Success Rate: 94.2% (↑2.1% from last week)\n• Total Jobs Processed: 125,420\n• Best Performing Client: Deal1 (98.5% success)\n• Peak Processing Hours: 14:00-15:00 UTC\n\nWould you like me to create a detailed chart or table for any of these metrics?`,
          responseType: "text" as const,
        },
        {
          content: `I've analyzed your indexing data for trends. Here are the key insights:\n\n📈 **Performance Trends:**\n• 15% increase in processing volume\n• 3.2% improvement in success rates\n• Client "Deal1" showing exceptional performance\n• Processing time decreased by 0.8 seconds\n\n💡 **Recommendations:**\n• Scale infrastructure during peak hours\n• Investigate failures in UK region\n• Optimize job batching for better throughput`,
          responseType: "text" as const,
        },
      ];

      const randomResponse =
        responses[Math.floor(Math.random() * responses.length)];

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant" as const,
        content: randomResponse.content,
        timestamp: new Date(),
        responseType: randomResponse.responseType,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleSuggestedQuestion = (question: string) => {
    setMessage(question);
  };

  const clearChat = () => {
    setMessages([messages[0]]); // Keep the initial welcome message
  };

  return (
    <div className="flex h-[800px] flex-col rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-700/50 p-6">
        <div className="flex items-center space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-500">
            <SparklesIcon className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI Data Assistant</h2>
            <p className="text-sm text-gray-400">
              Ask questions about your indexing data
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/20 rounded-full border border-green-500/30">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-xs text-green-300 font-medium">Online</span>
          </div>
          <button
            onClick={clearChat}
            className="p-2 rounded-xl bg-gray-700/50 hover:bg-gray-700 text-gray-400 hover:text-white transition-all duration-300"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex items-start space-x-3 max-w-4xl ${
                msg.type === "user" ? "flex-row-reverse space-x-reverse" : ""
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex-shrink-0 ${
                  msg.type === "user"
                    ? "h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center"
                    : "h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center"
                }`}
              >
                {msg.type === "user" ? (
                  <UserCircleIcon className="h-5 w-5 text-white" />
                ) : (
                  <SparklesIcon className="h-5 w-5 text-white" />
                )}
              </div>

              {/* Message Content */}
              <div
                className={`flex flex-col space-y-2 ${
                  msg.type === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`rounded-2xl px-4 py-3 max-w-2xl ${
                    msg.type === "user"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      : "bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 text-white"
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {msg.content}
                  </div>
                </div>

                {/* Timestamp and Response Type */}
                <div className="flex items-center space-x-2">
                  <div
                    className={`text-xs ${
                      msg.type === "user" ? "text-blue-200" : "text-gray-400"
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                  {msg.responseType && msg.type === "assistant" && (
                    <div className="flex items-center space-x-1">
                      {msg.responseType === "chart" && (
                        <ChartBarIcon className="h-3 w-3 text-gray-400" />
                      )}
                      {msg.responseType === "table" && (
                        <TableCellsIcon className="h-3 w-3 text-gray-400" />
                      )}
                      <span className="text-xs text-gray-400 capitalize">
                        {msg.responseType}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3 max-w-4xl">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <SparklesIcon className="h-5 w-5 text-white" />
              </div>
              <div className="bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 rounded-2xl px-4 py-3">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-300">
                    AI is thinking...
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Questions */}
      {messages.length <= 1 && !isLoading && (
        <div className="border-t border-gray-700/50 p-6">
          <div className="mb-4 flex items-center space-x-2 text-sm text-gray-300">
            <LightBulbIcon className="h-4 w-4 text-yellow-400" />
            <span>Suggested questions to get started:</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedQuestion(question)}
                className="text-left rounded-xl bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600/50 hover:border-gray-500/50 px-4 py-3 text-sm text-gray-300 hover:text-white transition-all duration-300 group"
              >
                <div className="flex items-center space-x-2">
                  <SparklesIcon className="h-4 w-4 text-purple-400 group-hover:text-purple-300" />
                  <span>{question}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-700/50 p-6">
        <div className="flex space-x-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && !e.shiftKey && handleSendMessage()
                }
                placeholder="Ask me anything about your indexing data..."
                disabled={isLoading}
                className="w-full rounded-xl bg-gray-800/50 border border-gray-700 px-4 py-3 pr-12 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 disabled:opacity-50"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <SparklesIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || isLoading}
            className="flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 text-white hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Input Helper */}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
          <span>Press Enter to send • Shift+Enter for new line</span>
          <span>AI-powered insights from your data</span>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;
