// Dark Theme App.tsx with Navigation
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import ChatAssistant from "./components/ChatAssistant";
import {
  ChartBarIcon,
  SparklesIcon,
  BellIcon,
  Cog6ToothIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "chat">("dashboard");
  const [notifications] = useState(3);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Header */}
        <header className="border-b border-gray-700/50 bg-gray-900/90 backdrop-blur-xl sticky top-0 z-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Logo and Brand */}
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">B</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    Botson AI Analyzer
                  </h1>
                  <p className="text-xs text-gray-400">
                    Job Indexing Analytics Platform
                  </p>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center space-x-6">
                <nav className="flex items-center space-x-1 bg-gray-800/50 rounded-xl p-1 backdrop-blur-sm border border-gray-700/50">
                  <button
                    onClick={() => setActiveTab("dashboard")}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      activeTab === "dashboard"
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                        : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                    }`}
                  >
                    <ChartBarIcon className="h-4 w-4" />
                    <span>Analytics Dashboard</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("chat")}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      activeTab === "chat"
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

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {/* Page Content */}
            <div
              className={`transition-all duration-500 ${
                activeTab === "dashboard"
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none absolute"
              }`}
            >
              {activeTab === "dashboard" && <Dashboard />}
            </div>

            <div
              className={`transition-all duration-500 ${
                activeTab === "chat"
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none absolute"
              }`}
            >
              {activeTab === "chat" && <ChatAssistant />}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-700/50 bg-gray-900/50 backdrop-blur-xl mt-16">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">B</span>
                </div>
                <div className="text-sm text-gray-400">
                  © 2024 Botson AI Analyzer. All rights reserved.
                </div>
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <span>Version 1.0.0</span>
                <span>•</span>
                <span>Last updated: {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </QueryClientProvider>
  );
}

export default App;
