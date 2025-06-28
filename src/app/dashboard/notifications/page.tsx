"use client";

import { useState, useEffect, useCallback } from 'react';
import { Bell, Check, CheckCheck, Trash2, Filter, Search, Eye, EyeOff, Calendar, User, MessageSquare, Heart, Star, AlertCircle, Info, Plus } from 'lucide-react';
import LoadingScreen from '@/components/shared/LoadingScreen';
import ErrorScreen from '@/components/shared/ErrorScreen';

interface Notification {
  _id: string;
  type: 'message' | 'comment' | 'like' | 'system' | 'update' | 'warning';
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  relatedId?: string;
  relatedType?: 'project' | 'blog' | 'experience' | 'message';
  actionUrl?: string;
  createdAt: string;
  readAt?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [stats, setStats] = useState({ total: 0, unread: 0, read: 0, highPriority: 0 });
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Debounced search
  const debouncedSearch = useCallback((callback: () => void, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => callback.apply(null, args), delay);
    };
  }, []);

  // Fetch notifications from API with debounce
  useEffect(() => {
    if (isInitialLoad) {
      fetchNotifications();
      setIsInitialLoad(false);
    } else {
      const debouncedFetch = debouncedSearch(fetchNotifications, 500);
      debouncedFetch();
    }
  }, [filter, typeFilter, searchTerm]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        filter: filter,
        type: typeFilter,
        search: searchTerm,
        limit: '50'
      });

      const response = await fetch(`/api/notifications?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch notifications');
      }

      setNotifications(data.data.notifications);
      setStats(data.data.stats);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch notifications');
      
      // Only create sample notifications on initial load if there's an error
      if (isInitialLoad) {
        await createSampleNotifications();
      }
    } finally {
      setLoading(false);
    }
  };

  const createSampleNotifications = async () => {
    // Create some sample notifications for demonstration
    const sampleNotifications = [
      {
        type: 'system',
        title: 'Welcome to Notifications!',
        message: 'Your notification system is now active. You\'ll receive updates about your portfolio activity here.',
        priority: 'medium'
      },
      {
        type: 'update',
        title: 'Portfolio Dashboard Ready',
        message: 'Your portfolio dashboard has been set up successfully with all features enabled.',
        priority: 'low'
      }
    ];

    try {
      for (const notification of sampleNotifications) {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notification)
        });
      }
      // Refresh notifications after creating samples
      setTimeout(fetchNotifications, 1000);
    } catch (error) {
      console.error('Error creating sample notifications:', error);
      setNotifications([]);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageSquare className="w-5 h-5" />;
      case 'comment': return <MessageSquare className="w-5 h-5" />;
      case 'like': return <Heart className="w-5 h-5" />;
      case 'system': return <Info className="w-5 h-5" />;
      case 'update': return <Star className="w-5 h-5" />;
      case 'warning': return <AlertCircle className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'high') {
      return 'bg-red-100 text-red-600 border-red-200';
    }
    switch (type) {
      case 'message': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'comment': return 'bg-green-100 text-green-600 border-green-200';
      case 'like': return 'bg-pink-100 text-pink-600 border-pink-200';
      case 'system': return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'update': return 'bg-purple-100 text-purple-600 border-purple-200';
      case 'warning': return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
      (filter === 'read' && notification.isRead) || 
      (filter === 'unread' && !notification.isRead);
    
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    
    const matchesSearch = !searchTerm || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesType && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAsRead' })
      });

      if (response.ok) {
        setNotifications(prev => prev.map(notification => 
          notification._id === id 
            ? { ...notification, isRead: true, readAt: new Date().toISOString() }
            : notification
        ));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAsUnread = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAsUnread' })
      });

      if (response.ok) {
        setNotifications(prev => prev.map(notification => 
          notification._id === id 
            ? { ...notification, isRead: false, readAt: undefined }
            : notification
        ));
      }
    } catch (error) {
      console.error('Error marking notification as unread:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(notification => notification._id !== id));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAllAsRead' })
      });

      if (response.ok) {
        setNotifications(prev => prev.map(notification => ({
          ...notification,
          isRead: true,
          readAt: notification.readAt || new Date().toISOString()
        })));
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleBulkAction = async (action: 'read' | 'unread' | 'delete') => {
    try {
      const response = await fetch('/api/notifications/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: action === 'read' ? 'markAsRead' : action === 'unread' ? 'markAsUnread' : 'delete',
          ids: selectedNotifications
        })
      });

      if (response.ok) {
        if (action === 'delete') {
          setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n._id)));
        } else {
          setNotifications(prev => prev.map(notification => 
            selectedNotifications.includes(notification._id)
              ? { 
                  ...notification, 
                  isRead: action === 'read',
                  readAt: action === 'read' ? new Date().toISOString() : undefined
                }
              : notification
          ));
        }
        setSelectedNotifications([]);
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const toggleSelectNotification = (id: string) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    );
  };

  const selectAllVisible = () => {
    const visibleIds = filteredNotifications.map(n => n._id);
    setSelectedNotifications(visibleIds);
  };

  const createTestNotification = async () => {
    try {
      const testNotifications = [
        {
          type: 'message',
          title: 'Test Contact Message',
          message: 'This is a test notification to demonstrate the messaging system.',
          priority: 'high',
          actionUrl: '/dashboard/messages'
        },
        {
          type: 'like',
          title: 'Project Appreciation',
          message: 'Your latest project received positive feedback from visitors.',
          priority: 'low',
          actionUrl: '/dashboard/projects'
        },
        {
          type: 'warning',
          title: 'System Alert',
          message: 'This is a test warning notification to show high priority alerts.',
          priority: 'high'
        }
      ];

      const randomNotification = testNotifications[Math.floor(Math.random() * testNotifications.length)];

      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(randomNotification)
      });

      if (response.ok) {
        fetchNotifications(); // Refresh the list
      }
    } catch (error) {
      console.error('Error creating test notification:', error);
    }
  };

  if (loading && isInitialLoad) {
    return <LoadingScreen type="global" message="Loading notifications..." />;
  }

  if (error) {
    return (
      <ErrorScreen
        title="Error Loading Notifications"
        message="We encountered an error while loading your notifications."
        error={error}
        onRetry={fetchNotifications}
      />
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600 mt-1">Stay updated with your portfolio activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total', count: stats.total, icon: Bell, color: 'blue' },
          { label: 'Unread', count: stats.unread, icon: Eye, color: 'yellow' },
          { label: 'Read', count: stats.read, icon: CheckCheck, color: 'green' },
          { label: 'High Priority', count: stats.highPriority, icon: AlertCircle, color: 'red' }
        ].map(({ label, count, icon: Icon, color }) => (
          <div key={label} className={`bg-${color}-50 p-6 rounded-xl border border-${color}-100`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{label}</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{count}</p>
              </div>
              <div className={`p-3 bg-${color}-100 rounded-lg`}>
                <Icon className={`w-6 h-6 text-${color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'read')}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="message">Messages</option>
            <option value="comment">Comments</option>
            <option value="like">Likes</option>
            <option value="system">System</option>
            <option value="update">Updates</option>
            <option value="warning">Warnings</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedNotifications.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {selectedNotifications.length} notification{selectedNotifications.length !== 1 ? 's' : ''} selected
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction('read')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Mark as Read
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-4">
        {loading && !isInitialLoad && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {!loading && filteredNotifications.length === 0 && (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
            <p className="text-gray-600">
              {searchTerm || filter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'You have no notifications yet'}
            </p>
          </div>
        )}

        {filteredNotifications.map((notification) => (
          <div
            key={notification._id}
            className={`bg-white rounded-xl shadow-sm border transition-all hover:shadow-md ${
              notification.isRead ? 'border-gray-100' : 'border-blue-200 bg-blue-50/30'
            }`}
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedNotifications.includes(notification._id)}
                  onChange={() => toggleSelectNotification(notification._id)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />

                {/* Icon */}
                <div className={`p-2 rounded-lg border ${getNotificationColor(notification.type, notification.priority)}`}>
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`font-semibold ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                        {notification.title}
                        {notification.priority === 'high' && (
                          <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                            High Priority
                          </span>
                        )}
                      </h3>
                      <p className={`mt-1 text-sm ${notification.isRead ? 'text-gray-500' : 'text-gray-700'}`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                        {notification.readAt && (
                          <span>Read {formatTimeAgo(notification.readAt)}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      {notification.actionUrl && (
                        <a
                          href={notification.actionUrl}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        >
                          View
                        </a>
                      )}
                      
                      <button
                        onClick={() => notification.isRead ? markAsUnread(notification._id) : markAsRead(notification._id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title={notification.isRead ? 'Mark as unread' : 'Mark as read'}
                      >
                        {notification.isRead ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      
                      <button
                        onClick={() => deleteNotification(notification._id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete notification"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}