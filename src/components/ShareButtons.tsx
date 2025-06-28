"use client";

import { useState } from 'react';
import { FaShareAlt, FaTwitter, FaFacebook, FaLinkedin, FaLink, FaWhatsapp, FaReddit, FaTelegram, FaEnvelope } from 'react-icons/fa';

interface ShareData {
  title: string;
  description: string;
  url: string;
  image?: string;
  tags?: string[];
  author?: string;
}

interface ShareButtonsProps {
  shareData: ShareData;
}

export default function ShareButtons({ shareData }: ShareButtonsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Native Web Share API support
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareData.title,
          text: shareData.description,
          url: shareData.url,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      setIsOpen(!isOpen);
    }
  };

  // Copy link to clipboard
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareData.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  // Share URLs for different platforms
  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.title)}&url=${encodeURIComponent(shareData.url)}&hashtags=${shareData.tags?.join(',') || ''}&via=${shareData.author || ''}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareData.title} - ${shareData.url}`)}`,
    reddit: `https://reddit.com/submit?url=${encodeURIComponent(shareData.url)}&title=${encodeURIComponent(shareData.title)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(shareData.title)}`,
    email: `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(`${shareData.description}\n\nRead more: ${shareData.url}`)}`
  };

  const shareButtons = [
    {
      name: 'Twitter',
      icon: FaTwitter,
      url: shareUrls.twitter,
      color: 'bg-blue-400 hover:bg-blue-500',
      textColor: 'text-white'
    },
    {
      name: 'Facebook',
      icon: FaFacebook,
      url: shareUrls.facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      textColor: 'text-white'
    },
    {
      name: 'LinkedIn',
      icon: FaLinkedin,
      url: shareUrls.linkedin,
      color: 'bg-blue-700 hover:bg-blue-800',
      textColor: 'text-white'
    },
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      url: shareUrls.whatsapp,
      color: 'bg-green-500 hover:bg-green-600',
      textColor: 'text-white'
    },
    {
      name: 'Reddit',
      icon: FaReddit,
      url: shareUrls.reddit,
      color: 'bg-orange-500 hover:bg-orange-600',
      textColor: 'text-white'
    },
    {
      name: 'Telegram',
      icon: FaTelegram,
      url: shareUrls.telegram,
      color: 'bg-blue-500 hover:bg-blue-600',
      textColor: 'text-white'
    },
    {
      name: 'Email',
      icon: FaEnvelope,
      url: shareUrls.email,
      color: 'bg-gray-600 hover:bg-gray-700',
      textColor: 'text-white'
    }
  ];

  const openShareWindow = (url: string) => {
    const width = 600;
    const height = 400;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    
    window.open(
      url,
      'share',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  };

  return (
    <div className="relative">
      {/* Main Share Button */}
      <button
        onClick={handleNativeShare}
        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
      >
        <FaShareAlt className="h-4 w-4" />
        <span className="font-medium">Share</span>
      </button>

      {/* Share Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-2">Share this article</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{shareData.title}</p>
          </div>

          {/* Copy Link Section */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={shareData.url}
                readOnly
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700"
              />
              <button
                onClick={copyLink}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  copied 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                {copied ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <FaLink className="w-4 h-4" />
                )}
              </button>
            </div>
            {copied && (
              <p className="text-xs text-green-600 mt-1">Link copied to clipboard!</p>
            )}
          </div>

          {/* Social Share Buttons */}
          <div className="p-4">
            <div className="grid grid-cols-4 gap-3">
              {shareButtons.map((button) => (
                <button
                  key={button.name}
                  onClick={() => {
                    if (button.name === 'Email') {
                      window.location.href = button.url;
                    } else {
                      openShareWindow(button.url);
                    }
                  }}
                  className={`flex flex-col items-center p-3 rounded-lg transition-all duration-200 transform hover:scale-105 ${button.color} ${button.textColor}`}
                  title={`Share on ${button.name}`}
                >
                  <button.icon className="h-5 w-5 mb-1" />
                  <span className="text-xs font-medium">{button.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Close Button */}
          <div className="p-3 border-t border-gray-100">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
} 