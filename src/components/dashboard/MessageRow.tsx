import { Star, Archive, Trash2, Clock, Reply, X, ChevronDown, ChevronUp } from 'lucide-react';
import { IMessage, MessageStatus } from '@/models/Message';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface MessageRowProps {
  message: IMessage;
  onStatusChange: (messageId: string, status: MessageStatus) => Promise<void>;
  onDelete: (messageId: string) => Promise<void>;
}

export default function MessageRow({ message, onStatusChange, onDelete }: MessageRowProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showReplyDialog, setShowReplyDialog] = useState(false);
  const [showThread, setShowThread] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyError, setReplyError] = useState<string | null>(null);

  const handleAction = async (action: 'archive' | 'delete') => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      if (action === 'archive') {
        await onStatusChange(message._id, MessageStatus.ARCHIVED);
      } else if (action === 'delete') {
        await onDelete(message._id);
      }
    } catch (error) {
      console.error(`Failed to ${action} message:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStarClick = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const newStatus = message.status === MessageStatus.READ ? MessageStatus.UNREAD : MessageStatus.READ;
      await onStatusChange(message._id, newStatus);
    } catch (error) {
      console.error('Failed to update message status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReply = async () => {
    if (isLoading || !replyMessage.trim()) return;
    setIsLoading(true);
    setReplyError(null);

    try {
      const response = await fetch(`/api/messages/${message._id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ replyMessage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reply');
      }

      // Close dialog and reset form
      setShowReplyDialog(false);
      setReplyMessage('');
      setShowThread(true); // Show thread after replying
      
      // Update message status through parent component
      await onStatusChange(message._id, MessageStatus.REPLIED);
    } catch (error) {
      console.error('Failed to send reply:', error);
      setReplyError(error instanceof Error ? error.message : 'Failed to send reply');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <tr
        className={`border-b last:border-0 ${
          message.status === MessageStatus.UNREAD ? 'bg-blue-50' : ''
        } ${isLoading ? 'opacity-50' : ''}`}
      >
        <td className="py-4 px-4">
          <div>
            <p className="font-medium text-gray-800">{message.name}</p>
            <p className="text-sm text-gray-500">{message.email}</p>
          </div>
        </td>
        <td className="py-4 px-4">
          <div>
            <div className="flex items-center gap-2">
              <p 
                className="font-medium text-gray-800 cursor-pointer hover:text-blue-600"
                onClick={() => router.push(`/dashboard/messages/${message._id}`)}
              >{message.subject}</p>
              {message.replies?.length > 0 && (
                <button
                  onClick={() => setShowThread(!showThread)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  {showThread ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              )}
            </div>
            <p className="text-sm text-gray-500 line-clamp-1">{message.message}</p>
          </div>
        </td>
        <td className="py-4 px-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock size={16} />
            <span>{new Date(message.createdAt).toLocaleDateString()}</span>
          </div>
        </td>
        <td className="py-4 px-4">
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowReplyDialog(true)}
              disabled={isLoading}
              className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <Reply size={18} />
            </button>
            <button
              onClick={handleStarClick}
              disabled={isLoading}
              className={`p-2 ${
                message.status === MessageStatus.READ ? 'text-yellow-500' : 'text-gray-400'
              } hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50`}
            >
              <Star size={18} />
            </button>
            <button
              onClick={() => handleAction('archive')}
              disabled={isLoading}
              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <Archive size={18} />
            </button>
            <button
              onClick={() => handleAction('delete')}
              disabled={isLoading}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </td>
      </tr>

      {/* Reply Thread */}
      {showThread && message.replies?.length > 0 && (
        <tr>
          <td colSpan={4} className="bg-gray-50">
            <div className="p-4 space-y-4">
              {message.replies.map((reply, index) => (
                <div
                  key={index}
                  className={`flex ${
                    reply.sentBy === 'admin' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-lg rounded-lg p-3 ${
                      reply.sentBy === 'admin'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{reply.message}</p>
                    <p className="text-xs mt-1 opacity-75">
                      {new Date(reply.sentAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}

      {/* Reply Dialog */}
      {showReplyDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Reply to {message.name}</h3>
                <button
                  onClick={() => setShowReplyDialog(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-500 mb-2">Original Message:</p>
                  <p className="text-gray-700">{message.message}</p>
                </div>

                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply..."
                  className="w-full h-40 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />

                {replyError && (
                  <p className="text-red-500 text-sm mt-2">{replyError}</p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowReplyDialog(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReply}
                  disabled={isLoading || !replyMessage.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 