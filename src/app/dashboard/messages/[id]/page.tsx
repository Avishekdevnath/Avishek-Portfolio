'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send } from 'lucide-react';
import { IMessage } from '@/models/Message';
import { MessageStatus } from '@/types/message';

export default function MessageDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [message, setMessage] = useState<IMessage | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMessage();
  }, [params.id]);

  const fetchMessage = async () => {
    try {
      const response = await fetch(`/api/messages/${params.id}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to fetch message');
      
      setMessage(data.data);
    } catch (error) {
      console.error('Error fetching message:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyMessage.trim() || !message) return;
    
    setIsSending(true);
    setError(null);

    try {
      const response = await fetch(`/api/messages/${message._id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ replyMessage }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to send reply');

      setReplyMessage('');
      fetchMessage(); // Refresh message to get the new reply
    } catch (error) {
      console.error('Error sending reply:', error);
      setError(error instanceof Error ? error.message : 'Failed to send reply');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error! </strong>
        <span className="block sm:inline">{error}</span>
        <button
          className="underline ml-2"
          onClick={fetchMessage}
        >
          Try again
        </button>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Message not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Message Details</h1>
      </div>

      {/* Message Info */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">{message.subject}</h2>
            <div className="flex gap-4 text-sm text-gray-500 mb-4">
              <p>From: {message.name} ({message.email})</p>
              <p>•</p>
              <p>{new Date(message.createdAt).toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="whitespace-pre-wrap">{message.message}</p>
            </div>
          </div>

          {/* Reply Thread */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">Reply Thread</h3>
            {message.replies && message.replies.length > 0 ? (
              <div className="space-y-4">
                {message.replies.map((reply, index) => (
                  <div
                    key={index}
                    className={`flex ${reply.sentBy === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-lg rounded-lg p-3 ${
                        reply.sentBy === 'admin'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{reply.message}</p>
                      <p className="text-xs mt-1 opacity-75">
                        {new Date(reply.sentAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No replies yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Reply Form */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Send Reply</h3>
          <div className="space-y-4">
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Type your reply..."
              className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSending}
            />
            <div className="flex justify-end">
              <button
                onClick={handleReply}
                disabled={isSending || !replyMessage.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
              >
                <Send size={16} />
                {isSending ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 