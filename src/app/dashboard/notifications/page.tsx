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
    return (...args: []) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => callback(), delay);
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
      // Error fetching notifications
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
      // Error creating sample notifications
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

  const getNotificationColor = (type: string, priority: string): string => {
    if (priority === 'high') return 'bg-[#fceaea] text-[#c0392b]';
    switch (type) {
      case 'message': return 'bg-[#e8f0fc] text-[#2d4eb3]';
      case 'comment': return 'bg-[#e6f2ee] text-[#2a6b4f]';
      case 'like': return 'bg-[#fdf0eb] text-[#d4622a]';
      case 'system': return 'bg-[#f3f1ee] text-[#6b5c4e]';
      case 'update': return 'bg-[#fef3e2] text-[#92510a]';
      case 'warning': return 'bg-[#fceaea] text-[#c0392b]';
      default: return 'bg-[#f3f1ee] text-[#6b5c4e]';
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
      // Error marking notification as read
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
      // Error marking notification as unread
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
      // Error deleting notification
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
      // Error marking all as read
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
      // Error performing bulk action
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
      // Error creating test notification
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

  const statCards = [
    { label: 'Total', count: stats.total, icon: Bell, tint: 'bg-[#e8f0fc] text-[#2d4eb3]' },
    { label: 'Unread', count: stats.unread, icon: Eye, tint: 'bg-[#fdf0eb] text-[#d4622a]' },
    { label: 'Read', count: stats.read, icon: CheckCheck, tint: 'bg-[#e6f2ee] text-[#2a6b4f]' },
    { label: 'High Priority', count: stats.highPriority, icon: AlertCircle, tint: 'bg-[#fceaea] text-[#c0392b]' },
  ];

  return (
    <div className="space-y-5">

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ label, count, icon: Icon, tint }) => (
          <div key={label} className="bg-white border border-[#e8e3db] rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${tint}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <p className="font-mono text-2xl font-semibold text-[#2a2118] leading-none">{count}</p>
              <p className="text-[0.72rem] text-[#8a7a6a] mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a7a6a]" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-3 bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.875rem] text-[#2a2118] focus:outline-none focus:border-[#d4622a] focus:ring-1 focus:ring-[#d4622a]/20"
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>

        {/* Status filter */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'read')}
          className="bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.875rem] text-[#2a2118] focus:outline-none focus:border-[#d4622a] focus:ring-1 focus:ring-[#d4622a]/20"
        >
          <option value="all">All</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>

        {/* Type filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.875rem] text-[#2a2118] focus:outline-none focus:border-[#d4622a] focus:ring-1 focus:ring-[#d4622a]/20"
        >
          <option value="all">All Types</option>
          <option value="message">Messages</option>
          <option value="comment">Comments</option>
          <option value="like">Likes</option>
          <option value="system">System</option>
          <option value="update">Updates</option>
          <option value="warning">Warnings</option>
        </select>

        {/* Mark All Read */}
        <button
          onClick={markAllAsRead}
          className="flex items-center gap-2 px-4 py-2 bg-[#2a2118] text-[#f0ece3] rounded-lg text-[0.82rem] font-medium hover:bg-[#d4622a] transition-colors"
        >
          <CheckCheck className="w-4 h-4" />
          Mark All Read
        </button>

        {/* Add Test */}
        <button
          onClick={createTestNotification}
          className="flex items-center gap-2 px-4 py-2 border border-[#ddd5c5] text-[#4a3728] rounded-lg text-[0.82rem] hover:border-[#2a2118] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Test
        </button>
      </div>

      {/* Bulk Action Bar */}
      {selectedNotifications.length > 0 && (
        <div className="bg-[#fdf9f7] border border-[#e8e3db] rounded-xl px-5 py-3 flex items-center justify-between">
          <p className="text-[0.82rem] text-[#4a3728] font-body">
            <span className="font-semibold font-mono text-[#2a2118]">{selectedNotifications.length}</span>
            {' '}notification{selectedNotifications.length !== 1 ? 's' : ''} selected
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkAction('read')}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#2a2118] text-[#f0ece3] rounded-lg text-[0.82rem] font-medium hover:bg-[#d4622a] transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              Mark Read
            </button>
            <button
              onClick={() => handleBulkAction('unread')}
              className="flex items-center gap-1.5 px-4 py-2 border border-[#ddd5c5] text-[#4a3728] rounded-lg text-[0.82rem] hover:border-[#2a2118] transition-colors"
            >
              <EyeOff className="w-3.5 h-3.5" />
              Mark Unread
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="p-2 text-[#8a7a6a] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete selected"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-3">
        {/* Inline loading spinner (subsequent loads) */}
        {loading && !isInitialLoad && (
          <div className="flex justify-center py-6">
            <div className="w-5 h-5 border-2 border-[#e8e3db] border-t-[#d4622a] rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredNotifications.length === 0 && (
          <div className="bg-white border border-[#e8e3db] rounded-xl p-12 shadow-sm flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-[#f3f1ee] flex items-center justify-center mb-4">
              <Bell className="w-6 h-6 text-[#8a7a6a]" />
            </div>
            <h3 className="text-[0.95rem] font-semibold text-[#2a2118] font-body mb-1">No notifications found</h3>
            <p className="text-[0.82rem] text-[#8a7a6a] font-body">
              {searchTerm || filter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'You have no notifications yet'}
            </p>
          </div>
        )}

        {/* Notification cards */}
        {filteredNotifications.map((notification) => (
          <div
            key={notification._id}
            className={`rounded-xl border shadow-sm transition-colors ${
              notification.isRead
                ? 'bg-white border-[#e8e3db]'
                : 'bg-[#fdf9f7] border-[#d4622a]/20 border-l-2 border-l-[#d4622a]'
            }`}
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedNotifications.includes(notification._id)}
                  onChange={() => toggleSelectNotification(notification._id)}
                  className="mt-1 h-4 w-4 accent-[#d4622a] rounded border-[#ddd5c5] cursor-pointer"
                />

                {/* Icon box */}
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type, notification.priority)}`}>
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`text-[0.875rem] font-semibold font-body ${notification.isRead ? 'text-[#4a3728]' : 'text-[#2a2118]'}`}>
                          {notification.title}
                        </h3>
                        {notification.priority === 'high' && (
                          <span className="text-[0.65rem] font-mono tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#fceaea] text-[#c0392b]">
                            high priority
                          </span>
                        )}
                        {!notification.isRead && (
                          <span className="text-[0.65rem] font-mono tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#fdf0eb] text-[#d4622a]">
                            unread
                          </span>
                        )}
                      </div>
                      <p className={`mt-0.5 text-[0.82rem] font-body leading-relaxed ${notification.isRead ? 'text-[#8a7a6a]' : 'text-[#4a3728]'}`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-[0.72rem] text-[#8a7a6a] font-mono">
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
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {notification.actionUrl && (
                        <a
                          href={notification.actionUrl}
                          className="flex items-center gap-1 px-3 py-1.5 text-[0.75rem] font-medium text-[#d4622a] bg-[#fdf0eb] rounded-lg hover:bg-[#f9e2d4] transition-colors font-body"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </a>
                      )}

                      <button
                        onClick={() => notification.isRead ? markAsUnread(notification._id) : markAsRead(notification._id)}
                        className="p-2 text-[#8a7a6a] hover:text-[#2a2118] hover:bg-[#f3f1ee] rounded-lg transition-colors"
                        title={notification.isRead ? 'Mark as unread' : 'Mark as read'}
                      >
                        {notification.isRead ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => deleteNotification(notification._id)}
                        className="p-2 text-[#8a7a6a] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
