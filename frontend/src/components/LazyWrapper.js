import React, { Suspense, useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import SkeletonLoader from './SkeletonLoader';

// Optimized Intersection Observer hook with throttling
const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const ref = useRef();
  const observerRef = useRef(null);

  const handleIntersection = useCallback(([entry]) => {
    setIsIntersecting(entry.isIntersecting);
    if (entry.isIntersecting && !hasIntersected) {
      setHasIntersected(true);
    }
  }, [hasIntersected]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Clean up existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer with throttled callback
    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold: 0.1,
      rootMargin: '100px',
      ...options
    });

    observerRef.current.observe(element);
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, options]);

  return [ref, isIntersecting, hasIntersected];
};

const LazyWrapper = memo(({ 
  children, 
  fallback = null, 
  delay = 0,
  skeletonType = 'card',
  skeletonCount = 1,
  className = '',
  useIntersection = true,
  threshold = 0.1,
  rootMargin = '100px'
}) => {
  const [ref, isIntersecting, hasIntersected] = useIntersectionObserver({
    threshold,
    rootMargin
  });
  const [showContent, setShowContent] = useState(delay === 0 && !useIntersection);

  useEffect(() => {
    if (useIntersection && hasIntersected) {
      if (delay > 0) {
        const timer = setTimeout(() => {
          setShowContent(true);
        }, delay);
        return () => clearTimeout(timer);
      } else {
        setShowContent(true);
      }
    } else if (!useIntersection && delay > 0) {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [delay, useIntersection, hasIntersected]);

  const defaultFallback = useMemo(() => (
    <SkeletonLoader 
      type={skeletonType} 
      count={skeletonCount} 
      className={className}
    />
  ), [skeletonType, skeletonCount, className]);

  return (
    <div ref={ref} className={className}>
      <Suspense fallback={fallback || defaultFallback}>
        {showContent ? children : (fallback || defaultFallback)}
      </Suspense>
    </div>
  );
});

export default LazyWrapper;
