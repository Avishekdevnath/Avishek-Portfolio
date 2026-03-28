'use client';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-white">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-semibold">You&apos;re offline</h1>
        <p className="text-gray-400">Check your connection and try again.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 border border-white/20 rounded hover:bg-white/10 transition"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
