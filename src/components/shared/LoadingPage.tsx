import React from 'react';
import LoadingScreen from './LoadingScreen';

interface LoadingPageProps {
  text?: string;
}

const LoadingPage: React.FC<LoadingPageProps> = ({ text }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
    <LoadingScreen type="global" message={text || 'Loading...'} />
  </div>
);

export default LoadingPage; 