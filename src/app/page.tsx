'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleModeSelection = (mode: 'paste' | 'copy') => {
    router.push(`/${mode}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center max-w-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Vacant Vectors Clipboard
        </h1>
        
        <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Disclaimer:</strong> This is a demonstration tool for educational purposes only. 
            Do not store sensitive or confidential information.
          </p>
        </div>
        
        <p className="text-gray-600 mb-8">
          Select a mode to get started
        </p>
        
        <div className="space-y-4">
          <button
            onClick={() => handleModeSelection('paste')}
            className="w-64 py-4 px-6 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-200"
          >
            Paste Mode
          </button>
          
          <button
            onClick={() => handleModeSelection('copy')}
            className="w-64 py-4 px-6 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition-colors duration-200"
          >
            Copy Mode
          </button>
        </div>
      </div>
    </div>
  );
}
