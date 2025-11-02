import React, { memo, useMemo } from 'react';

const SkeletonLoader = memo(({ 
  type = 'card', 
  count = 1, 
  className = '',
  height = 'h-32',
  width = 'w-full'
}) => {
  const renderSkeleton = useMemo(() => {
    switch (type) {
      case 'card':
        return (
          <div className={`bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-8 animate-pulse ${className}`}>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-300 rounded-2xl"></div>
                <div>
                  <div className="h-6 bg-gray-300 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                </div>
              </div>
              <div className="h-8 bg-gray-300 rounded-full w-16"></div>
            </div>
            <div className="space-y-3 mb-6">
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex space-x-4">
                <div className="h-6 bg-gray-300 rounded w-16"></div>
                <div className="h-6 bg-gray-300 rounded w-20"></div>
              </div>
              <div className="h-10 bg-gray-300 rounded-2xl w-24"></div>
            </div>
          </div>
        );

      case 'dashboard':
        return (
          <div className={`bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-8 animate-pulse ${className}`}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
              <div>
                <div className="h-8 bg-gray-300 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-32"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-gray-400 rounded-lg"></div>
                    <div className="h-6 bg-gray-400 rounded w-24"></div>
                  </div>
                  <div className="h-8 bg-gray-400 rounded w-16"></div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              <div className="h-4 bg-gray-300 rounded w-4/6"></div>
            </div>
          </div>
        );

      case 'list':
        return (
          <div className={`space-y-4 ${className}`}>
            {[...Array(count)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 border-2 border-gray-100 animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-300 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  </div>
                  <div className="h-8 bg-gray-300 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'text':
        return (
          <div className={`animate-pulse ${className}`}>
            <div className={`${height} ${width} bg-gray-300 rounded`}></div>
          </div>
        );

      case 'button':
        return (
          <div className={`h-12 bg-gray-300 rounded-2xl animate-pulse ${className}`}></div>
        );

      default:
        return (
          <div className={`${height} ${width} bg-gray-300 rounded animate-pulse ${className}`}></div>
        );
    }
  }, [type, className, height, width]);

  const skeletonArray = useMemo(() => {
    if (count > 1) {
      return (
        <div className="space-y-4">
          {[...Array(count)].map((_, i) => (
            <div key={i}>
              {renderSkeleton}
            </div>
          ))}
        </div>
      );
    }
    return renderSkeleton;
  }, [count, renderSkeleton]);

  return skeletonArray;
});

export default SkeletonLoader;
