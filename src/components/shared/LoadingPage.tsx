import React from 'react';
import Loader from './Loader';

interface LoadingPageProps {
  text?: string;
}

const LoadingPage: React.FC<LoadingPageProps> = ({ text }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
    <Loader text={text || 'Loading...'} size={48} />
  </div>
);

export default LoadingPage; 