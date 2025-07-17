// Dark Theme LoadingSpinner.tsx
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "primary" | "white" | "gray";
  className?: string;
}

const LoadingSpinner = ({
  size = "md",
  className = "",
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  // const colorClasses = {
  //   primary: "text-purple-400",
  //   white: "text-white",
  //   gray: "text-gray-400",
  // };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        {/* Outer ring */}
        <div
          className={`${sizeClasses[size]} rounded-full border-2 border-gray-600/30`}
        ></div>

        {/* Spinning gradient ring */}
        <div
          className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-2 border-transparent`}
        >
          <div
            className={`h-full w-full rounded-full border-2 border-transparent border-t-purple-400 border-r-blue-400 animate-spin`}
          ></div>
        </div>

        {/* Inner glow effect */}
        <div
          className={`absolute inset-1 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 animate-pulse`}
        ></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
