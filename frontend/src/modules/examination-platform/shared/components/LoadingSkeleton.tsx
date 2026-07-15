import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingSkeletonProps {
  rows?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ rows = 3 }) => {
  return (
    <div className="space-y-4 w-full">
      <Skeleton className="h-6 w-1/4 rounded-md" />
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full rounded-md" />
        ))}
      </div>
    </div>
  );
};
