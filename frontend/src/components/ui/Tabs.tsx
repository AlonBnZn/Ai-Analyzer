// Dark Theme Tabs.tsx
import { createContext, useContext, type ReactNode } from "react";
import { clsx } from "clsx";

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
}

export function Tabs({ value, onValueChange, children }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className="w-full">{children}</div>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  className?: string;
  children: ReactNode;
}

export function TabsList({ className, children }: TabsListProps) {
  return (
    <div
      className={clsx(
        "inline-flex h-12 items-center justify-center rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-1 text-gray-400",
        className
      )}
    >
      {children}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabsTrigger({ value, children, className }: TabsTriggerProps) {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("TabsTrigger must be used within a Tabs component");
  }

  const { value: currentValue, onValueChange } = context;
  const isActive = currentValue === value;

  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
          : "text-gray-300 hover:text-white hover:bg-gray-700/50",
        className
      )}
      onClick={() => onValueChange(value)}
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("TabsContent must be used within a Tabs component");
  }

  const { value: currentValue } = context;

  if (currentValue !== value) {
    return null;
  }

  return (
    <div
      className={clsx(
        "mt-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 animate-fade-in",
        className
      )}
    >
      {children}
    </div>
  );
}
