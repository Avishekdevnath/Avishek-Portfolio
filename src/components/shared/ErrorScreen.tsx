import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorScreenProps {
  title?: string;
  message?: string;
  error?: string;
  onRetry?: () => void;
  showHomeButton?: boolean;
  showRetry?: boolean;
  className?: string;
}

export default function ErrorScreen({
  title = 'Something went wrong',
  message = 'We encountered an error while processing your request.',
  error,
  onRetry,
  showHomeButton = true,
  showRetry = true,
  className = ''
}: ErrorScreenProps) {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[400px] p-6 ${className}`}>
      <div className="text-center max-w-lg">
        {/* Error Icon */}
        <div className="mb-6">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto animate-bounce" />
        </div>

        {/* Error Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {title}
        </h2>

        {/* Error Message */}
        <p className="text-gray-600 mb-4">
          {message}
        </p>

        {/* Technical Error Details */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
            <p className="text-red-700 text-sm font-mono break-all">
              {error}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {showRetry && onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
              Try Again
            </button>
          )}
          
          {showHomeButton && (
            <Link 
              href="/"
              className="flex items-center gap-2 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}