import React, { memo, useState, useRef, useEffect } from 'react';

// Lazy loading image component
const LazyImage = memo(({ 
  src, 
  alt, 
  className = '', 
  placeholder = null,
  fallback = null,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  return (
    <div ref={imgRef} className={`relative ${className}`} {...props}>
      {!isInView ? (
        placeholder || (
          <div className="w-full h-full bg-gray-200 animate-pulse rounded flex items-center justify-center">
            <div className="text-gray-400 text-sm">Loading...</div>
          </div>
        )
      ) : hasError ? (
        fallback || (
          <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
            <div className="text-gray-400 text-sm">Failed to load</div>
          </div>
        )
      ) : (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
    </div>
  );
});

export default LazyImage;
