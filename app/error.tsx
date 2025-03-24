'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Something went wrong!</h1>
      <p className="text-lg text-gray-600 mb-6">An error occurred on this page.</p>
      <button
        onClick={() => reset()}
        className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition-colors mr-4"
      >
        Try again
      </button>
      <a href="/" className="mt-4 text-blue-600 hover:underline">
        Return to Home
      </a>
    </div>
  );
} 