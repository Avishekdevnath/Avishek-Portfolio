import { FileQuestion } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center max-w-lg mx-auto">
          {/* 404 Icon */}
          <div className="mb-8">
            <FileQuestion className="w-24 h-24 text-blue-500 mx-auto" />
          </div>

          {/* 404 Text */}
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </Link>
            <Link 
              href="/contact"
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Contact Support
            </Link>
          </div>

          {/* Additional Links */}
          <div className="mt-12">
            <p className="text-gray-600 mb-4">You might want to check out:</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/projects"
                className="text-blue-600 hover:underline"
              >
                Projects
              </Link>
              <Link 
                href="/blogs"
                className="text-blue-600 hover:underline"
              >
                Blog Posts
              </Link>
              <Link 
                href="/about"
                className="text-blue-600 hover:underline"
              >
                About Me
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}