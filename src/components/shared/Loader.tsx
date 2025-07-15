import React from 'react';

interface LoaderProps {
  text?: string;
  size?: number;
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ text, size = 40, className = '' }) => (
  <div className={`flex flex-col items-center justify-center ${className}`}>
    <svg
      className="animate-spin text-blue-600"
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="opacity-25"
        cx="20"
        cy="20"
        r="16"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M36 20c0-8.837-7.163-16-16-16v8a8 8 0 018 8h8z"
      />
    </svg>
    {text && <span className="mt-3 text-gray-600 text-sm">{text}</span>}
  </div>
);

export default Loader; 