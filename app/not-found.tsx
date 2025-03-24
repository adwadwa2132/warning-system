export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
      <p className="text-lg text-gray-600 mb-6">The page you are looking for does not exist.</p>
      <a href="/" className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition-colors">
        Return to Home
      </a>
    </div>
  );
} 