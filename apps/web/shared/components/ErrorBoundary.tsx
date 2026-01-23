"use client";

import { Component, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error boundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-bg-panel rounded-[20px] border border-border">
          <AlertCircle className="w-12 h-12 text-error mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2 font-[family-name:var(--font-heading)]">
            Something went wrong
          </h2>
          <p className="text-sm text-text-muted text-center mb-6 max-w-md">
            An unexpected error occurred. Please try refreshing or contact support if the problem persists.
          </p>
          <button
            onClick={this.handleRetry}
            className={cn(
              "flex items-center gap-2 px-6 py-3",
              "bg-accent-yellow text-bg-primary font-medium rounded-[12px]",
              "hover:bg-accent-yellow/90 transition-colors"
            )}
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <pre className="mt-6 p-4 bg-bg-primary rounded-[12px] text-xs text-error overflow-auto max-w-full max-h-32">
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for easier use with hooks
interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-bg-panel rounded-[20px] border border-border">
      <AlertCircle className="w-12 h-12 text-error mb-4" />
      <h2 className="text-xl font-semibold text-text-primary mb-2 font-[family-name:var(--font-heading)]">
        Something went wrong
      </h2>
      <p className="text-sm text-text-muted text-center mb-6 max-w-md">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        onClick={resetError}
        className={cn(
          "flex items-center gap-2 px-6 py-3",
          "bg-accent-yellow text-bg-primary font-medium rounded-[12px]",
          "hover:bg-accent-yellow/90 transition-colors"
        )}
      >
        <RefreshCw className="w-4 h-4" />
        Try Again
      </button>
    </div>
  );
}
