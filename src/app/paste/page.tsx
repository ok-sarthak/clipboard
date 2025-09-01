'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PastePage() {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const router = useRouter();

  // Save content manually
  const saveContent = async () => {
    if (!content.trim()) {
      alert('Please enter some content to save.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/clipboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        alert('Content saved successfully!');
      } else {
        alert('Failed to save content. Please try again.');
      }
    } catch (error) {
      console.error('Failed to save content:', error);
      alert('Failed to save content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear local content on page unload but keep in MongoDB
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem('paste-content');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setHasUnsavedChanges(true);
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Paste Mode - Vacant Vectors Clipboard</h1>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Back to Home
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-600">
            Type or paste content below, then click &quot;Save Content&quot; to store it.
          </p>
          {lastSaved && (
            <p className="text-xs text-green-600 mt-1">
              Last saved: {lastSaved.toLocaleTimeString()}
            </p>
          )}
          {hasUnsavedChanges && (
            <p className="text-xs text-orange-600 mt-1">You have unsaved changes</p>
          )}
        </div>

        <textarea
          value={content}
          onChange={handleContentChange}
          placeholder="Start typing or paste your content here..."
          className="w-full h-96 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 bg-white mb-4"
          autoFocus
        />

        <div className="flex gap-4">
          <button
            onClick={saveContent}
            disabled={isLoading || !content.trim()}
            className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Saving...' : 'Save Content'}
          </button>
          
          <button
            onClick={() => {
              setContent('');
              setHasUnsavedChanges(false);
            }}
            className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
