import React, { useEffect } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

interface ToastProps {
  title: string;
  description?: string;
  status: 'success' | 'error' | 'info';
  duration?: number;
  isClosable?: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({
  title,
  description,
  status,
  duration = 5000,
  isClosable = true,
  onClose,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (status) {
      case 'success':
        return <FiCheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <FiAlertCircle className="w-5 h-5 text-red-500" />;
      case 'info':
        return <FiInfo className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getBackgroundColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-50';
      case 'error':
        return 'bg-red-50';
      case 'info':
        return 'bg-blue-50';
      default:
        return 'bg-white';
    }
  };

  const getBorderColor = () => {
    switch (status) {
      case 'success':
        return 'border-green-400';
      case 'error':
        return 'border-red-400';
      case 'info':
        return 'border-blue-400';
      default:
        return 'border-gray-200';
    }
  };

  return (
    <div
      className={`fixed bottom-4 right-4 max-w-sm w-full ${getBackgroundColor()} border ${getBorderColor()} rounded-lg shadow-lg`}
      role="alert"
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">{getIcon()}</div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">{title}</p>
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
          </div>
          {isClosable && (
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className="bg-transparent rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <FiX className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Toast; 