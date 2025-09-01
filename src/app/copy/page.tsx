'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ClipboardEntry {
  _id: string;
  content: string;
  createdAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalEntries: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function CopyPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [entries, setEntries] = useState<ClipboardEntry[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 0,
    totalEntries: 0,
    hasNext: false,
    hasPrev: false
  });
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
      loadEntries(1);
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
        await loadEntries(1);
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

  const loadEntries = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/clipboard?page=${page}&limit=10`);
      const data = await response.json();
      
      if (response.ok) {
        setEntries(data.entries);
        setPagination(data.pagination);
      }
    } catch {
      console.error('Failed to load entries');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);

      // Log the copy activity for audit purposes
      try {
        await fetch('/api/log-copy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contentId: id,
            content: content,
          }),
        });
      } catch (logError) {
        console.error('Failed to log copy activity:', logError);
        // Don't show error to user as it's just for logging
      }
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
        // Instead of filtering, reload the current page to maintain pagination
        await loadEntries(pagination.currentPage);
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
        // Reload first page after deleting all entries
        await loadEntries(1);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-200">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Copy Mode
            </h1>
            <p className="text-gray-600">
              Enter your passcode to access clipboard history
            </p>
          </div>

          <form onSubmit={handlePasscodeSubmit}>
            <div className="mb-6">
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode"
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                autoFocus
                required
              />
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                'Access Clipboard'
              )}
            </button>
          </form>

          <button
            onClick={() => router.push('/')}
            className="w-full mt-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors border border-gray-200"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Clipboard History</h1>
              <p className="text-gray-600 mt-1">Vacant Vectors - Copy Mode</p>
            </div>
            <button
              onClick={() => {
                sessionStorage.removeItem('clipboard-authenticated');
                router.push('/');
              }}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors border border-gray-200"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </span>
            </button>
          </div>
        </div>

        {entries.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <button
                  onClick={() => loadEntries(pagination.currentPage)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 border border-blue-200"
                >
                  <svg 
                    className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                    />
                  </svg>
                  {isLoading ? 'Refreshing...' : 'Refresh'}
                </button>
                <button
                  onClick={deleteAllEntries}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-red-200"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {isDeleting ? 'Deleting...' : 'Delete All'}
                  </span>
                </button>
              </div>
              <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border">
                <span className="font-medium">{pagination.totalEntries}</span> total entries
              </div>
            </div>
          </div>
        )}

        {entries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clipboard entries found</h3>
            <p className="text-gray-600 mb-8">
              Use Paste Mode to add some content first, or refresh to check for new entries.
            </p>
            <button
              onClick={() => loadEntries(1)}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 mx-auto"
            >
              <svg 
                className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
              {isLoading ? 'Refreshing...' : 'Refresh Entries'}
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {entries.map((entry) => (
                <div
                  key={entry._id}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200 hover:border-gray-300"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {formatDate(entry.createdAt)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(entry.content, entry._id)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                          copiedId === entry._id
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'
                        }`}
                      >
                        {copiedId === entry._id ? (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Copied!
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => deleteEntry(entry._id)}
                        disabled={isDeleting}
                        className="px-4 py-2 text-sm font-medium bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-gray-800 whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-lg border">
                    {truncateContent(entry.content, 200)}
                  </div>
                  
                  {entry.content.length > 200 && (
                    <details className="mt-3">
                      <summary className="text-blue-600 cursor-pointer text-sm hover:text-blue-800 font-medium">
                        Show full content
                      </summary>
                      <div className="mt-3 text-gray-800 whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-lg border">
                        {entry.content}
                      </div>
                    </details>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination Component */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => loadEntries(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev || isLoading}
                    className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </span>
                  </button>

                  {/* Page Numbers */}
                  <div className="flex space-x-1">
                    {(() => {
                      const pages = [];
                      const currentPage = pagination.currentPage;
                      const totalPages = pagination.totalPages;
                      
                      // Always show first page
                      if (currentPage > 3) {
                        pages.push(
                          <button
                            key={1}
                            onClick={() => loadEntries(1)}
                            disabled={isLoading}
                            className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            1
                          </button>
                        );
                        if (currentPage > 4) {
                          pages.push(<span key="ellipsis1" className="px-2 py-2 text-gray-500">...</span>);
                        }
                      }

                      // Show current page and surrounding pages
                      for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
                        pages.push(
                          <button
                            key={i}
                            onClick={() => loadEntries(i)}
                            disabled={isLoading}
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                              i === currentPage
                                ? 'bg-blue-600 text-white border border-blue-600'
                                : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {i}
                          </button>
                        );
                      }

                      // Always show last page
                      if (currentPage < totalPages - 2) {
                        if (currentPage < totalPages - 3) {
                          pages.push(<span key="ellipsis2" className="px-2 py-2 text-gray-500">...</span>);
                        }
                        pages.push(
                          <button
                            key={totalPages}
                            onClick={() => loadEntries(totalPages)}
                            disabled={isLoading}
                            className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {totalPages}
                          </button>
                        );
                      }

                      return pages;
                    })()}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => loadEntries(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext || isLoading}
                    className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="flex items-center gap-1">
                      Next
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </button>
                </nav>
              </div>
            )}

            {/* Page Info */}
            <div className="mt-4 text-center text-sm text-gray-500">
              Showing page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalEntries} total entries)
            </div>
          </>
        )}
      </div>
    </div>
  );
}
