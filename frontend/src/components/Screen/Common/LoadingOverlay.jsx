import React from 'react';
import { useLoading } from '../../../context/LoadingContext';

const LoadingOverlay = () => {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[999] flex items-center justify-center">
      <div className="bg-white border-2 border-black p-4 rounded-none">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-black rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-4 h-4 bg-black rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-4 h-4 bg-black rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay; 