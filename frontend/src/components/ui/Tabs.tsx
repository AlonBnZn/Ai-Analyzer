// src/components/ui/Tabs.tsx
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
        "inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 p-1 text-gray-500",
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
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "bg-white text-gray-950 shadow-sm"
          : "text-gray-600 hover:text-gray-900",
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
        "mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
        className
      )}
    >
      {children}
    </div>
  );
}
