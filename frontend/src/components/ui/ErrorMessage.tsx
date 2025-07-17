// Dark Theme ErrorMessage.tsx
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface ErrorMessageProps {
  message: string;
  error?: Error;
  className?: string;
}

const ErrorMessage = ({
  message,
  error,
  className = "",
}: ErrorMessageProps) => {
  return (
    <div
      className={`rounded-2xl bg-red-500/10 border border-red-500/20 p-6 ${className}`}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className="p-2 rounded-xl bg-red-500/20">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-300 mb-1">Error</h3>
          <p className="text-red-200 text-sm">{message}</p>
          {error && process.env.NODE_ENV === "development" && (
            <details className="mt-2">
              <summary className="text-xs text-red-300 cursor-pointer hover:text-red-200">
                Show details
              </summary>
              <pre className="mt-2 text-xs text-red-200 bg-red-900/20 rounded-lg p-2 overflow-auto">
                {error.toString()}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
