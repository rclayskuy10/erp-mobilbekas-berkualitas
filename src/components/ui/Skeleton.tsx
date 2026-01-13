'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export default function Skeleton({ 
  className = '', 
  variant = 'text',
  width,
  height
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-300 rounded motion-safe:animate-pulse motion-reduce:bg-gray-200';
  
  const variantClasses = {
    text: 'h-4',
    circular: 'rounded-full',
    rectangular: 'h-4'
  };

  const styles: React.CSSProperties = {};
  if (width) styles.width = typeof width === 'number' ? `${width}px` : width;
  if (height) styles.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={styles}
    />
  );
}

// Dashboard Page Skeleton
export function DashboardSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton variant="circular" className="w-12 h-12" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts/Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton variant="circular" className="w-8 h-8" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Table Skeleton
export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6 sm:mb-8">
        <Skeleton className="h-10 w-full sm:w-80" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4">
          {/* Table Header */}
          <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {[...Array(columns)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-20" />
            ))}
          </div>

          {/* Table Rows */}
          {[...Array(rows)].map((_, rowIndex) => (
            <div key={rowIndex} className="grid gap-4 mb-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {[...Array(columns)].map((_, colIndex) => (
                <Skeleton key={colIndex} className="h-4" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Form Skeleton
export function FormSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="space-y-6">
          {[...Array(6)].map((_, i) => (
            <div key={i}>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          
          <div className="flex gap-4 pt-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}