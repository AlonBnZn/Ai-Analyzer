// Fixed App Layout - frontend/src/App.tsx
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  ChartBarIcon,
  SparklesIcon,
  BellIcon,
  Cog6ToothIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import Dashboard from "./pages/Dashboard";
import ChatAssistant from "./components/ChatAssistant";
import "./App.css";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "assistant">(
    "dashboard"
  );
  const [notifications] = useState(3);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-gray-900/80 border-b border-gray-700/50 flex-shrink-0">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Logo and Navigation */}
              <div className="flex items-center space-x-8">
                {/* Logo */}
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-500">
                    <ChartBarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">
                      Botson AI Analyzer
                    </h1>
                    <p className="text-xs text-gray-400">
                      Job Indexing Analytics
                    </p>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="flex space-x-1">
                  <button
                    onClick={() => setActiveTab("dashboard")}
                    className={`flex items-center space-x-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                      activeTab === "dashboard"
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                        : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                    }`}
                  >
                    <ChartBarIcon className="h-4 w-4" />
                    <span>Analytics Dashboard</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("assistant")}
                    className={`flex items-center space-x-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                      activeTab === "assistant"
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                        : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                    }`}
                  >
                    <SparklesIcon className="h-4 w-4" />
                    <span>AI Assistant</span>
                  </button>
                </nav>
              </div>

              {/* User Actions */}
              <div className="flex items-center space-x-4">
                {/* Live Status */}
                <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/20 rounded-full border border-green-500/30">
                  <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-sm text-green-300 font-medium">
                    Live Data
                  </span>
                </div>

                {/* Notifications */}
                <div className="relative">
                  <button className="p-2 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-300">
                    <BellIcon className="h-5 w-5" />
                    {notifications > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center animate-pulse">
                        {notifications}
                      </span>
                    )}
                  </button>
                </div>

                {/* Settings */}
                <button className="p-2 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-300">
                  <Cog6ToothIcon className="h-5 w-5" />
                </button>

                {/* User Profile */}
                <div className="flex items-center space-x-3 px-3 py-2 bg-gray-800/50 rounded-xl border border-gray-700">
                  <UserCircleIcon className="h-6 w-6 text-gray-300" />
                  <div className="text-left">
                    <div className="text-sm font-medium text-white">
                      Account Manager
                    </div>
                    <div className="text-xs text-gray-400">Admin</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content - Fixed height calculation */}
        <main className="flex-1 overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 h-full">
            {/* Page Content */}
            {activeTab === "dashboard" && (
              <div className="h-full">
                <Dashboard />
              </div>
            )}

            {activeTab === "assistant" && (
              <div className="h-full flex items-center justify-center">
                <div className="w-full max-w-4xl">
                  <ChatAssistant />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;
