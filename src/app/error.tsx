'use client';

import { useEffect } from 'react';
import { AlertOctagon } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-red-50">
        <div className="text-center max-w-lg mx-auto">
          {/* Error Icon */}
          <div className="mb-8">
            <AlertOctagon className="w-24 h-24 text-red-500 mx-auto" />
          </div>

          {/* Error Text */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Something went wrong!
          </h1>
          <p className="text-gray-600 mb-8">
            We apologize for the inconvenience. An unexpected error has occurred.
          </p>

          {/* Error Details (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-8 mx-auto max-w-md">
              <p className="text-red-700 text-sm font-mono break-all">
                {error.message || error.toString()}
              </p>
              {error.digest && (
                <p className="text-red-500 text-xs mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={reset}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <Link 
              href="/"
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back to Home
            </Link>
          </div>

          {/* Support Contact */}
          <div className="mt-12">
            <p className="text-gray-600">
              If the problem persists, please{' '}
              <Link 
                href="/contact" 
                className="text-blue-600 hover:underline"
              >
                contact support
              </Link>
              .
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}