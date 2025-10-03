'use client';

import { useEffect, useState } from 'react';
import { Mail, Star, Archive } from 'lucide-react';
import MessageRow from '@/components/dashboard/MessageRow';
import { IMessage } from '@/models/Message';
import { MessageStatus } from '@/types/message';
import mongoose from 'mongoose';

interface MessageStats {
  total: number;
  unread: number;
  read: number;
  archived: number;
}

interface MessageWithId extends Omit<IMessage, '_id'> {
  _id: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<MessageWithId[]>([]);
  const [stats, setStats] = useState<MessageStats>({
    total: 0,
    unread: 0,
    read: 0,
    archived: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages');
      const data = await response.json();
      
      if (!response.ok) throw new Error('Failed to fetch messages');
      
      if (data.success) {
        const messagesWithStringId = data.data.messages.map((message: any) => ({
          ...message,
          _id: message._id.toString()
        }));
        setMessages(messagesWithStringId);
        setStats(data.data.stats);
      } else {
        throw new Error(data.error || 'Failed to fetch messages');
      }
    } catch (error) {
      // Error fetching messages
      setError(error instanceof Error ? error.message : 'Failed to fetch messages');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleStatusChange = async (messageId: string, newStatus: MessageStatus) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error('Failed to update message status');
      
      // Refresh messages to get updated data
      await fetchMessages();
    } catch (error) {
      // Error updating message status
      setError(error instanceof Error ? error.message : 'Failed to update message');
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) throw new Error('Failed to delete message');
      
      // Refresh messages to get updated data
      await fetchMessages();
    } catch (error) {
      // Error deleting message
      setError(error instanceof Error ? error.message : 'Failed to delete message');
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error! </strong>
        <span className="block sm:inline">{error}</span>
        <button
          className="underline ml-2"
          onClick={() => {
            setError(null);
            fetchMessages();
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
        <p className="text-gray-600 mt-1">Manage your contact form submissions</p>
      </div>

      {/* Message Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total', count: stats.total, icon: Mail, color: 'blue' },
          { label: 'Unread', count: stats.unread, icon: Mail, color: 'yellow' },
          { label: 'Read', count: stats.read, icon: Star, color: 'green' },
          { label: 'Archived', count: stats.archived, icon: Archive, color: 'purple' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`p-3 bg-${stat.color}-50 rounded-lg`}>
                  <Icon size={24} className={`text-${stat.color}-500`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-xl font-semibold mt-1">{stat.count}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">From</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Subject</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((message) => (
                  <MessageRow
                    key={message._id.toString()}
                    message={message}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                  />
                ))}
                {messages.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">
                      No messages found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 