'use client';

import { useEffect, useState } from 'react';

interface LikeButtonProps {
  slug: string;
  initialLikes: number;
}

// Simple function to generate a random device ID
function generateDeviceId() {
  return `device_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
}

export default function LikeButton({ slug, initialLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user has liked this post before
    const deviceId = localStorage.getItem('deviceId') || generateDeviceId();
    localStorage.setItem('deviceId', deviceId);
    
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}');
    setHasLiked(!!likedPosts[slug]);
  }, [slug]);

  const handleLike = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const deviceId = localStorage.getItem('deviceId')!;
      
      // Optimistically update the UI
      const newLikeCount = hasLiked ? likes - 1 : likes + 1;
      setLikes(newLikeCount);
      setHasLiked(!hasLiked);

      // Update localStorage optimistically
      const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}');
      if (!hasLiked) {
        likedPosts[slug] = true;
      } else {
        delete likedPosts[slug];
      }
      localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
      
      const response = await fetch(`/api/blogs/${slug}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceId }),
      });

      if (!response.ok) {
        // Revert optimistic updates if the request fails
        setLikes(likes);
        setHasLiked(hasLiked);
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update like');
      }

      const data = await response.json();

      // Update with actual server data
      if (data.success) {
        setLikes(data.data.likes);
        setHasLiked(data.data.hasLiked);
      } else {
        throw new Error(data.error || 'Failed to update like');
      }
    } catch (error) {
      console.error('Error updating like:', error);
      setError(error instanceof Error ? error.message : 'Failed to update like');
      
      // Revert localStorage on error
      const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}');
      if (hasLiked) {
        likedPosts[slug] = true;
      } else {
        delete likedPosts[slug];
      }
      localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center">
      <button
        onClick={handleLike}
        disabled={isLoading}
        className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-all duration-200 hover:scale-105 ${
          hasLiked
            ? 'bg-red-100 text-red-600 hover:bg-red-200'
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