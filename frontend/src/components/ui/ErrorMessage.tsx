// src/components/ui/ErrorMessage.tsx
interface ErrorMessageProps {
  message: string;
  error: Error | null;
}

export default function ErrorMessage({ message, error }: ErrorMessageProps) {
  return (
    <div className="rounded-lg border border-error-200 bg-error-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-error-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-error-800">{message}</h3>
          {error && (
            <div className="mt-2 text-sm text-error-700">
              {error ? error.message : "An unknown error occurred"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
