"use client";

import { useState, useEffect } from 'react';

interface Comment {
  id: string;
  name: string;
  content: string;
  createdAt: string;
}

interface CommentSectionProps {
  slug: string;
}

export default function CommentSection({ slug }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`/api/blogs/${slug}/comments`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setComments(data.data.comments || []);
      } else {
        throw new Error(data.error || 'Failed to load comments');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !content.trim()) {
      setError('Name and comment are required');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const response = await fetch(`/api/blogs/${slug}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          content: content.trim(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setName('');
        setEmail('');
        setContent('');
        // Refresh comments to show the new comment
        await fetchComments();
      } else {
        throw new Error(data.error || 'Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      setError(error instanceof Error ? error.message : 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Comments ({comments.length})</h2>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="comment-name" className="block text-sm font-medium text-gray-700">
              Name *
            </label>
            <input
              type="text"
              id="comment-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={submitting}
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="comment-email" className="block text-sm font-medium text-gray-700">
              Email (optional)
            </label>
            <input
              type="email"
              id="comment-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={submitting}
              placeholder="your@email.com"
            />
          </div>
        </div>
        <div>
          <label htmlFor="comment-content" className="block text-sm font-medium text-gray-700">
            Comment *
          </label>
          <textarea
            id="comment-content"
            required
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={submitting}
            placeholder="Write your comment here..."
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || !name.trim() || !content.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-gray-900">{comment.name}</h4>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 