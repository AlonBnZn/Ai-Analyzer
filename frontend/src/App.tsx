// src/App.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import ChatAssistant from "./components/ChatAssistant";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/Tabs";
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

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <header className="border-b bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
                  <span className="text-sm font-bold text-white">B</span>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Botson AI Analyzer
                  </h1>
                  <p className="text-xs text-gray-500">
                    Job Indexing Analytics Platform
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-success-500"></div>
                  <span className="text-sm text-gray-600">Live Data</span>
                </div>
                <div className="rounded-lg bg-gray-100 px-3 py-1">
                  <span className="text-sm font-medium text-gray-700">
                    Account Manager
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "dashboard" | "chat")
            }
          >
            <TabsList className="mx-auto mb-8 grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="dashboard">Analytics Dashboard</TabsTrigger>
              <TabsTrigger value="chat">AI Assistant</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="animate-fade-in">
              <Dashboard />
            </TabsContent>

            <TabsContent value="chat" className="animate-fade-in">
              <ChatAssistant />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;
