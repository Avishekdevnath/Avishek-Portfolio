'use client';

import { useState, useEffect } from 'react';
import { LogOut, User, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  onMenuToggle?: () => void;
  isOpen?: boolean;
}

export default function DashboardHeader({ onMenuToggle, isOpen }: HeaderProps) {
  const [username, setUsername] = useState('Admin');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        if (data.success && data.data.fullName) {
          setUsername(data.data.fullName);
        }
      } catch (error) {
        // Failed to fetch user info
      }
    };
    fetchUserInfo();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        router.push('/login');
      } else {
        // Logout failed
        // Still redirect to login even if API fails
        router.push('/login');
      }
    } catch (error) {
      // Logout error
      // Still redirect to login even if API fails
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-30 flex items-center justify-between px-4 sm:px-6">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          {/* Hamburger / Close icon */}
          <span className="block w-5 h-0.5 bg-gray-700 relative">
            <span className="absolute top-[-6px] left-0 w-5 h-0.5 bg-gray-700"></span>
            <span className="absolute top-[6px] left-0 w-5 h-0.5 bg-gray-700"></span>
          </span>
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
      </div>

      {/* Right side - User info and actions */}
      <div className="flex items-center gap-4">
        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{username}</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
        </div>

        {/* Settings link */}
        <button
          onClick={() => router.push('/dashboard/settings')}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Settings"
        >
          <Settings size={18} />
        </button>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            isLoggingOut
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-red-50 text-red-700 hover:bg-red-100'
          }`}
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </span>
        </button>
      </div>
    </header>
  );
}
