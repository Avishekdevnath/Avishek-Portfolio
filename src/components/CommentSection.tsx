"use client";

import { useState, useEffect } from 'react';

interface Comment {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  replies?: Comment[];
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
        const raw = data.data.comments || [];
        const mapRecursive = (c: any): Comment => ({
          id: c._id,
          name: c.name,
          content: c.content,
          createdAt: c.createdAt,
          replies: (c.replies || []).map((r: any) => mapRecursive(r)),
        });
        const mapped = raw.map(mapRecursive);
        setComments(mapped);
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

  const totalCount = comments.reduce((acc, c) => acc + 1 + (c.replies ? c.replies.length : 0), 0);

  return (
    <div className="space-y-6 font-ui">
      <h2 className="text-h4 weight-semibold">Comments ({totalCount})</h2>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-6 text-sm weight-regular">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label htmlFor="comment-name" className="block text-caption text-gray-700">
              Name *
            </label>
            <input
              type="text"
              id="comment-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              disabled={submitting}
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="comment-email" className="block text-caption text-gray-700">
              Email (optional)
            </label>
            <input
              type="email"
              id="comment-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              disabled={submitting}
              placeholder="your@email.com"
            />
          </div>
        </div>
        <div>
          <label htmlFor="comment-content" className="block text-caption text-gray-700 weight-medium">
            Comment *
          </label>
          <textarea
            id="comment-content"
            required
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            disabled={submitting}
            placeholder="Write your comment here..."
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || !name.trim() || !content.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-button"
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
        <div className="text-center py-6 text-gray-500 text-sm">
          <p>No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="space-y-4">
              <CommentCard comment={comment} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Small component for comment + its replies recursively
function CommentCard({ comment }: { comment: Comment }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 text-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1.5">
            <h4 className="font-medium text-gray-900 text-sm">{comment.name}</h4>
            <span className="text-xs text-gray-500">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-gray-700 whitespace-pre-wrap text-sm leading-5">{comment.content}</p>
        </div>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 pl-5 border-l-2 border-gray-200 space-y-3 text-sm">
          {comment.replies.map((r) => (
            <CommentCard key={r.id} comment={r} />
          ))}
        </div>
      )}
    </div>
  );
} 