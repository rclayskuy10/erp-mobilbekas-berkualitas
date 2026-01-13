'use client';

import React from 'react';
import { useLoading } from '@/contexts/LoadingContext';

export default function LoadingBar() {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-1 bg-blue-600 animate-pulse">
        <div className="h-full bg-blue-400 animate-bounce" style={{
          animation: 'loading-bar 1.5s ease-in-out infinite'
        }} />
      </div>
      <style jsx>{`
        @keyframes loading-bar {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}