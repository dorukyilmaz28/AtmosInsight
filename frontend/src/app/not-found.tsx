'use client';

import Link from 'next/link';
import { Home, ArrowLeft, RefreshCw } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* 404 Animation */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-white/20 mb-4 animate-pulse">
            404
          </div>
          <div className="w-32 h-32 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-spin opacity-20"></div>
            <div className="absolute inset-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-ping opacity-30"></div>
            <div className="absolute inset-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-bounce"></div>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Page Not Found
        </h1>
        <p className="text-xl text-white/80 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or may have been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 backdrop-blur-md border border-white/20"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 backdrop-blur-md border border-white/20"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Refresh
          </button>
        </div>

        {/* Additional Help */}
        <div className="mt-12 p-6 bg-white/5 rounded-2xl backdrop-blur-md border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-3">
            Need Help?
          </h3>
          <div className="text-white/70 space-y-2">
            <p>• Check the URL and try again</p>
            <p>• Navigate from the home page to your desired section</p>
            <p>• Refresh the page or clear your browser cache</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-white/50 text-sm">
          <p>NASA Space Apps Challenge - Weather Assistant</p>
        </div>
      </div>
    </div>
  );
}
