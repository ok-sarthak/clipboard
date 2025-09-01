'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ClipboardEntry {
  _id: string;
  content: string;
  createdAt: string;
}

export default function CopyPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [entries, setEntries] = useState<ClipboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user was previously authenticated in this session
    const authenticated = sessionStorage.getItem('clipboard-authenticated');
    if (authenticated === 'true') {
      setIsAuthenticated(true);
      loadEntries();
    }

    // Clear authentication on page reload/close
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('clipboard-authenticated');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/verify-passcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ passcode }),
      });

      const data = await response.json();

      if (data.valid) {
        setIsAuthenticated(true);
        sessionStorage.setItem('clipboard-authenticated', 'true');
        await loadEntries();
      } else {
        setError('Invalid passcode. Please try again.');
      }
    } catch (error: unknown) {
      setError('Failed to verify passcode. Please try again.');
      console.error('Passcode verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEntries = async () => {
    try {
      const response = await fetch('/api/clipboard');
      const data = await response.json();
      
      if (response.ok) {
        setEntries(data.entries);
      }
    } catch {
      console.error('Failed to load entries');
    }
  };

  const copyToClipboard = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      alert('Failed to copy to clipboard');
    }
  };

  const deleteEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/clipboard/delete?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (response.ok) {
        setEntries(entries.filter(entry => entry._id !== id));
        alert('Entry deleted successfully');
      } else {
        alert(data.error || 'Failed to delete entry');
      }
    } catch (error) {
      console.error('Failed to delete entry:', error);
      alert('Failed to delete entry');
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteAllEntries = async () => {
    if (!confirm('Are you sure you want to delete ALL entries? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch('/api/clipboard/delete?deleteAll=true', {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (response.ok) {
        setEntries([]);
        alert(data.message || 'All entries deleted successfully');
      } else {
        alert(data.error || 'Failed to delete all entries');
      }
    } catch (error) {
      console.error('Failed to delete all entries:', error);
      alert('Failed to delete all entries');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const truncateContent = (content: string, maxLength = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Copy Mode - Vacant Vectors Clipboard
          </h1>
          
          <p className="text-gray-600 mb-6 text-center">
            Enter the passcode to access your clipboard history
          </p>

          <form onSubmit={handlePasscodeSubmit}>
            <div className="mb-4">
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                autoFocus
                required
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Verifying...' : 'Access Clipboard'}
            </button>
          </form>

          <button
            onClick={() => router.push('/')}
            className="w-full mt-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Clipboard History - Vacant Vectors</h1>
          <button
            onClick={() => {
              sessionStorage.removeItem('clipboard-authenticated');
              router.push('/');
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Back to Home
          </button>
        </div>

        {entries.length > 0 && (
          <div className="mb-6 flex gap-4">
            <button
              onClick={deleteAllEntries}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isDeleting ? 'Deleting...' : 'Delete All'}
            </button>
            <span className="text-sm text-gray-500 flex items-center">
              Total entries: {entries.length}
            </span>
          </div>
        )}

        {entries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No clipboard entries found.</p>
            <p className="text-sm text-gray-400 mt-2">
              Use Paste Mode to add some content first.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div
                key={entry._id}
                className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-gray-500">
                    {formatDate(entry.createdAt)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(entry.content, entry._id)}
                      className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                        copiedId === entry._id
                          ? 'bg-green-600 text-white'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      {copiedId === entry._id ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={() => deleteEntry(entry._id)}
                      disabled={isDeleting}
                      className="px-3 py-1 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="text-gray-800 whitespace-pre-wrap font-mono text-sm bg-white p-3 rounded border">
                  {truncateContent(entry.content, 200)}
                </div>
                
                {entry.content.length > 200 && (
                  <details className="mt-2">
                    <summary className="text-blue-500 cursor-pointer text-sm hover:underline">
                      Show full content
                    </summary>
                    <div className="mt-2 text-gray-800 whitespace-pre-wrap font-mono text-sm bg-white p-3 rounded border">
                      {entry.content}
                    </div>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
