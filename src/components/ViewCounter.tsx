'use client';

import { useEffect, useState } from 'react';

interface ViewCounterProps {
  slug: string;
  initialViews: number;
}

export default function ViewCounter({ slug, initialViews }: ViewCounterProps) {
  const [views, setViews] = useState(initialViews);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const incrementViews = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/blogs/${slug}/views`, {
          method: 'POST',
        });
        
        if (!response.ok) {
          throw new Error('Failed to increment views');
        }

        const data = await response.json();
        if (data.success) {
          setViews(data.data.views);
        }
      } catch (error) {
        console.error('Error incrementing views:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Only increment views when the component mounts
    incrementViews();
  }, [slug]);

  return (
    <div className="flex items-center space-x-2 hover:text-blue-600 transition-all duration-200 group">
      <div className="relative">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-5 w-5 group-hover:scale-110 transition-transform duration-200 ${isLoading ? 'animate-pulse' : ''}`} 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
        </svg>
      </div>
      <span className="font-medium text-sm">
        {views.toLocaleString()} view{views !== 1 ? 's' : ''}
      </span>
    </div>
  );
} 