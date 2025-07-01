'use client';

import { useEffect, useState } from 'react';

interface LikeButtonProps {
  slug: string;
  initialLikes: number;
}

export default function LikeButton({ slug, initialLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user has liked this post before
    const deviceId = localStorage.getItem('deviceId') || 'defaultDeviceId';
    localStorage.setItem('deviceId', deviceId);
    
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}');
    setHasLiked(!!likedPosts[slug]);
  }, [slug]);

  const handleLike = async () => {
    if (hasLiked) return; // Prevent multiple likes per device

    try {
      setIsLoading(true);
      setError(null);

      // Optimistically update UI
      setLikes((prev) => prev + 1);
      setHasLiked(true);

      const response = await fetch(`/api/blogs/${slug}/like`, {
        method: 'POST',
      });

      if (!response.ok) {
        // Revert optimistic update
        setLikes((prev) => prev - 1);
        setHasLiked(false);
        const errorData = await response.json();
        // If already liked (409) set state anyway
        if (response.status === 409) {
          setHasLiked(true);
        }
        throw new Error(errorData.error || 'Failed to like');
      }

      const data = await response.json();
      if (data.likesCount !== undefined) {
        setLikes(data.likesCount);
      }

      // Persist liked state locally (device-level)
      const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}');
      likedPosts[slug] = true;
      localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
    } catch (error) {
      console.error('Error liking post:', error);
      setError(error instanceof Error ? error.message : 'Failed to like');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center">
      <button
        onClick={handleLike}
        disabled={isLoading || hasLiked}
        className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-all duration-200 hover:scale-105 ${
          hasLiked
            ? 'bg-red-100 text-red-600 cursor-not-allowed'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-red-500'
        } ${isLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 transition-all duration-200 ${
            hasLiked ? 'text-red-500' : ''
          } ${isLoading ? 'animate-pulse' : ''}`}
          fill={hasLiked ? 'currentColor' : 'none'}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <span className="text-sm font-medium">
          {likes.toLocaleString()}
        </span>
      </button>
      {error && (
        <div className="ml-2 text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
          {error}
        </div>
      )}
    </div>
  );
} 