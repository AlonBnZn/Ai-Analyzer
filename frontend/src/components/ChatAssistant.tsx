import { useState, useRef, useEffect } from "react";
import {
  PaperAirplaneIcon,
  SparklesIcon,
  LightBulbIcon,
  UserCircleIcon,
  ChartBarIcon,
  TableCellsIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { apiService } from "../services/api";
import type {
  SendChatMessageRequest,
  Message,
  ConnectionStatus,
} from "../types/chat";

const ChatAssistant = () => {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(
    () => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  );
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("testing");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "assistant",
      content: `Hello! I'm your AI assistant for analyzing job indexing data. You can ask me questions like:

• "What is the total number of jobs in the collection?"
• "Show me the top 5 clients by job volume"
• "Which countries have the most failed jobs?"
• "Create a chart showing success rates by client"
• "Display a table of recent processing statistics"

I can respond with text explanations, data tables, or interactive charts!

How can I help you today?`,
      timestamp: new Date(),
      responseType: "text",
    },
  ]);

  const suggestedQuestions = [
    "What is the total number of jobs in the collection?",
    "Show me top 5 clients by job volume",
    "Which countries have the most failed jobs?",
    "Create a chart showing success rates by client",
    "Display processing statistics in a table",
    "What is the average success rate across all clients?",
  ];

  useEffect(() => {
    const testConnection = async () => {
      setConnectionStatus("testing");
      try {
        const isConnected = await apiService.testAssistantConnection();
        setConnectionStatus(isConnected ? "connected" : "disconnected");
      } catch (error) {
        console.error("Connection test failed:", error);
        setConnectionStatus("disconnected");
      }
    };

    testConnection();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      const request: SendChatMessageRequest = {
        message: userMessage.content,
        sessionId: sessionId,
      };

      console.log("Sending message to assistant:", request);
      const response = await apiService.sendAssistantMessage(request);
      console.log("Assistant response:", response);

      if (response.success && response.data) {
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          type: "assistant",
          content: response.data.message,
          timestamp: new Date(),
          responseType:
            response.data.type === "error" ? "error" : response.data.type,
          data: response.data.data,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setConnectionStatus("connected");
      } else {
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          type: "assistant",
          content:
            response.error ||
            "I apologize, but I encountered an error processing your request. Please try again.",
          timestamp: new Date(),
          responseType: "error",
        };

        setMessages((prev) => [...prev, errorMessage]);
        if (
          response.error?.includes("connection") ||
          response.error?.includes("timeout")
        ) {
          setConnectionStatus("disconnected");
        }
      }
    } catch (error: unknown) {
      console.error("Error in handleSendMessage:", error);

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: "assistant",
        content:
          "I'm experiencing connection issues. Please check that the backend is running and try again.",
        timestamp: new Date(),
        responseType: "error",
      };

      setMessages((prev) => [...prev, errorMessage]);
      setConnectionStatus("disconnected");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    if (!isLoading && connectionStatus === "connected") {
      setMessage(question);
    }
  };

  const clearChat = () => {
    setMessages([messages[0]]); // Keep the initial welcome message
  };

  const retryConnection = async () => {
    setConnectionStatus("testing");
    try {
      const isConnected = await apiService.testAssistantConnection();
      setConnectionStatus(isConnected ? "connected" : "disconnected");
    } catch (error) {
      console.error("Retry connection failed:", error);
      setConnectionStatus("disconnected");
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "text-green-300 bg-green-500/20 border-green-500/30";
      case "disconnected":
        return "text-red-300 bg-red-500/20 border-red-500/30";
      case "testing":
        return "text-yellow-300 bg-yellow-500/20 border-yellow-500/30";
      default:
        return "text-gray-300 bg-gray-500/20 border-gray-500/30";
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Connected";
      case "disconnected":
        return "Disconnected";
      case "testing":
        return "Testing...";
      default:
        return "Unknown";
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return "bg-green-400 animate-pulse";
      case "disconnected":
        return "bg-red-400";
      case "testing":
        return "bg-yellow-400 animate-pulse";
      default:
        return "bg-gray-400";
    }
  };

  // Render different response types
  const renderMessageContent = (msg: Message) => {
    if (
      msg.type === "user" ||
      msg.responseType === "text" ||
      msg.responseType === "error"
    ) {
      return (
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {msg.content}
        </div>
      );
    }

    // Render table response
    if (msg.responseType === "table" && msg.data && Array.isArray(msg.data)) {
      return (
        <div className="space-y-3">
          <div className="text-sm leading-relaxed">{msg.content}</div>
          <div className="overflow-x-auto rounded-lg border border-gray-600/50">
            <table className="min-w-full divide-y divide-gray-600">
              <thead className="bg-gray-700/50">
                <tr>
                  {Object.keys(msg.data[0] || {}).map((key) => (
                    <th
                      key={key}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      {key.replace(/_/g, " ")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-gray-800/30 divide-y divide-gray-600">
                {(msg.data as Record<string, unknown>[])
                  .slice(0, 10)
                  .map((row, index) => (
                    <tr key={index} className="hover:bg-gray-700/30">
                      {Object.values(row).map((value, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-4 py-3 text-sm text-gray-200"
                        >
                          {typeof value === "number"
                            ? value.toLocaleString()
                            : String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
            {(msg.data as Record<string, unknown>[]).length > 10 && (
              <div className="bg-gray-700/30 px-4 py-2 text-xs text-gray-400 text-center">
                Showing first 10 of{" "}
                {(msg.data as Record<string, unknown>[]).length} results
              </div>
            )}
          </div>
        </div>
      );
    }

    // Render chart response
    if (msg.responseType === "chart" && msg.data && Array.isArray(msg.data)) {
      const chartData = msg.data as Record<string, unknown>[];
      const dataKeys = Object.keys(chartData[0] || {});
      const xAxisKey = dataKeys[0]; 
      const yAxisKey =
        dataKeys.find((key) => typeof chartData[0][key] === "number") ||
        dataKeys[1]; 

      console.log("Chart Debug:", {
        chartData: chartData.slice(0, 3),
        dataKeys,
        xAxisKey,
        yAxisKey,
        sampleValues: chartData[0],
      });

      return (
        <div className="space-y-4">
          <div className="text-sm leading-relaxed">{msg.content}</div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/50">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={chartData.slice(0, 15)}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#374151"
                  opacity={0.7}
                />
                <XAxis
                  dataKey={xAxisKey}
                  stroke="#9ca3af"
                  fontSize={11}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={11}
                  tickFormatter={(value) => {
                    if (value >= 1000000)
                      return (value / 1000000).toFixed(1) + "M";
                    if (value >= 1000) return (value / 1000).toFixed(1) + "K";
                    return value.toString();
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#f3f4f6",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "#e5e7eb" }}
                  formatter={(value: unknown, name: string) => [
                    typeof value === "number"
                      ? value.toLocaleString()
                      : String(value),
                    name,
                  ]}
                />
                <Bar
                  dataKey={yAxisKey}
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                  stroke="#a855f7"
                  strokeWidth={1}
                />
              </BarChart>
            </ResponsiveContainer>
            {chartData.length > 15 && (
              <div className="text-xs text-gray-400 text-center mt-2">
                Showing top 15 of {chartData.length} results
              </div>
            )}
            <div className="text-xs text-gray-500 mt-2">
              X-axis: {xAxisKey} | Y-axis: {yAxisKey}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="whitespace-pre-wrap text-sm leading-relaxed">
        {msg.content}
        {msg.data && (
          <details className="mt-2">
            <summary className="text-xs text-gray-300 cursor-pointer">
              View raw data
            </summary>
            <pre className="text-xs text-gray-300 mt-1 bg-black/20 p-2 rounded overflow-auto max-h-32">
              {JSON.stringify(msg.data, null, 2)}
            </pre>
          </details>
        )}
      </div>
    );
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
              Text, table, and chart responses available
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Connection Status */}
          <div
            className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getConnectionStatusColor()}`}
          >
            <div
              className={`h-2 w-2 rounded-full ${getConnectionStatusIcon()}`}
            ></div>
            <span className="text-xs font-medium">
              {getConnectionStatusText()}
            </span>
            {connectionStatus === "disconnected" && (
              <button
                onClick={retryConnection}
                className="text-xs underline hover:no-underline ml-1"
                disabled={connectionStatus !== "disconnected"}
              >
                Retry
              </button>
            )}
          </div>

          <button
            onClick={clearChat}
            className="p-2 rounded-xl bg-gray-700/50 hover:bg-gray-700 text-gray-400 hover:text-white transition-all duration-300"
            title="Clear chat"
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
              className={`flex items-start space-x-3 max-w-5xl ${
                msg.type === "user" ? "flex-row-reverse space-x-reverse" : ""
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex-shrink-0 ${
                  msg.type === "user"
                    ? "h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center"
                    : `h-8 w-8 rounded-full ${
                        msg.responseType === "error"
                          ? "bg-gradient-to-br from-red-500 to-orange-500"
                          : "bg-gradient-to-br from-purple-500 to-blue-500"
                      } flex items-center justify-center`
                }`}
              >
                {msg.type === "user" ? (
                  <UserCircleIcon className="h-5 w-5 text-white" />
                ) : msg.responseType === "error" ? (
                  <ExclamationTriangleIcon className="h-5 w-5 text-white" />
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
                  className={`rounded-2xl px-4 py-3 ${
                    msg.responseType === "table" || msg.responseType === "chart"
                      ? "max-w-none"
                      : "max-w-2xl"
                  } ${
                    msg.type === "user"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      : msg.responseType === "error"
                      ? "bg-red-900/50 backdrop-blur-sm border border-red-600/50 text-red-100"
                      : "bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 text-white"
                  }`}
                >
                  {renderMessageContent(msg)}
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
                      {msg.responseType === "text" && (
                        <DocumentTextIcon className="h-3 w-3 text-gray-400" />
                      )}
                      {msg.responseType === "error" && (
                        <ExclamationTriangleIcon className="h-3 w-3 text-red-400" />
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
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  </div>
                  <span className="text-sm text-gray-300">
                    AI is analyzing...
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions - only show when chat is empty and connected */}
      {messages.length === 1 && connectionStatus === "connected" && (
        <div className="px-6 py-4 border-t border-gray-700/50">
          <div className="flex items-center space-x-2 mb-3">
            <LightBulbIcon className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-medium text-gray-300">
              Try these sample questions
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedQuestion(question)}
                disabled={isLoading}
                className="text-left p-3 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600/30 hover:border-gray-600/50 text-sm text-gray-300 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Connection Error Message */}
      {connectionStatus === "disconnected" && (
        <div className="px-6 py-4 border-t border-gray-700/50">
          <div className="flex items-center space-x-2 p-3 bg-red-900/20 border border-red-600/30 rounded-lg">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 flex-shrink-0" />
            <div className="text-sm text-red-200">
              <p className="font-medium">Connection Failed</p>
              <p className="text-xs text-red-300 mt-1">
                Make sure the backend server is running on localhost:5000
              </p>
            </div>
            <button
              onClick={retryConnection}
              className="ml-auto px-3 py-1 text-xs bg-red-600/50 hover:bg-red-600/70 text-red-100 rounded border border-red-500/50 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-700/50 p-6">
        <div className="flex items-end space-x-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={
                  connectionStatus === "connected"
                    ? "Ask for text, table, or chart responses..."
                    : connectionStatus === "testing"
                    ? "Connecting to AI assistant..."
                    : "Backend connection required..."
                }
                disabled={isLoading || connectionStatus !== "connected"}
                className="w-full rounded-xl bg-gray-800/50 border border-gray-700 px-4 py-3 pr-12 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <SparklesIcon
                  className={`h-5 w-5 ${
                    connectionStatus === "connected"
                      ? "text-purple-400"
                      : "text-gray-400"
                  }`}
                />
              </div>
            </div>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={
              !message.trim() || isLoading || connectionStatus !== "connected"
            }
            className="flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 text-white hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Input Helper */}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
          <span>Press Enter to send • Try asking for tables or charts</span>
          <span>
            {connectionStatus === "connected" &&
              "AI can respond with text, tables, or charts"}
            {connectionStatus === "disconnected" &&
              "Backend connection required"}
            {connectionStatus === "testing" && "Testing connection..."}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;
