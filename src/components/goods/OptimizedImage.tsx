import React from 'react';
import { cn } from '@/lib/utils';
import { useImageLoader } from '@/hooks/useImageLoader';
import { Archive, RefreshCw } from 'lucide-react';

/**
 * OptimizedImage - High-performance image component with loading states
 * 
 * Features:
 * - Progressive loading with skeleton animation
 * - Automatic retry on failure
 * - Smooth fade-in animation when loaded
 * - Customizable fallback content
 * - Responsive and accessible
 */

interface OptimizedImageProps {
  /** Image source URL */
  src: string | null | undefined;
  /** Alt text for accessibility */
  alt: string;
  /** Additional CSS classes */
  className?: string;
  /** Custom fallback content when image fails to load */
  fallback?: React.ReactNode;
  /** Show retry button on error */
  showRetry?: boolean;
  /** Enable automatic retry on failure */
  enableRetry?: boolean;
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Loading placeholder type */
  loadingType?: 'skeleton' | 'spinner' | 'blur';
  /** Loading placeholder color scheme */
  colorScheme?: 'light' | 'dark' | 'goods';
  /** Custom aspect ratio (e.g., "16/9", "1/1") */
  aspectRatio?: string;
  /** Callback when image loads successfully */
  onLoad?: () => void;
  /** Callback when image fails to load */
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  fallback,
  showRetry = true,
  enableRetry = true,
  maxRetries = 2,
  loadingType = 'skeleton',
  colorScheme = 'light',
  aspectRatio,
  onLoad,
  onError
}) => {
  // Use our optimized image loading hook
  const { 
    src: imageSrc, 
    isLoading, 
    hasError, 
    isLoaded, 
    retry 
  } = useImageLoader(src, {
    enableRetry,
    maxRetries,
    preload: true
  });

  // Handle load/error callbacks
  React.useEffect(() => {
    if (isLoaded && onLoad) {
      onLoad();
    }
  }, [isLoaded, onLoad]);

  React.useEffect(() => {
    if (hasError && onError) {
      onError();
    }
  }, [hasError, onError]);

  // Color scheme styles
  const getColorSchemeClasses = () => {
    switch (colorScheme) {
      case 'dark':
        return 'bg-gray-800 text-gray-300';
      case 'goods':
        return 'bg-emerald-50 text-emerald-600';
      default:
        return 'bg-gray-200 text-gray-500';
    }
  };

  // Loading placeholder component
  const LoadingPlaceholder = () => {
    const baseClasses = `w-full h-full flex items-center justify-center ${getColorSchemeClasses()}`;
    
    switch (loadingType) {
      case 'spinner':
        return (
          <div className={baseClasses}>
            <RefreshCw className="h-8 w-8 animate-spin" />
          </div>
        );
      case 'blur':
        return (
          <div className={cn(baseClasses, 'bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse')}>
            <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
              <Archive className="h-8 w-8 opacity-50" />
            </div>
          </div>
        );
      default: // skeleton
        return (
          <div className={cn(baseClasses, 'animate-pulse')}>
            <div className="text-center">
              <Archive className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <div className="text-xs opacity-75">Loading...</div>
            </div>
          </div>
        );
    }
  };

  // Error fallback component
  const ErrorFallback = () => {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className={cn('w-full h-full flex flex-col items-center justify-center', getColorSchemeClasses())}>
        <Archive className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <span className="text-xs text-center opacity-75 mb-2">
          Failed to load image
        </span>
        {showRetry && (
          <button
            onClick={retry}
            className="text-xs px-2 py-1 rounded bg-white/20 hover:bg-white/30 transition-colors"
            aria-label="Retry loading image"
          >
            Retry
          </button>
        )}
      </div>
    );
  };

  // Container classes with aspect ratio support
  const containerClasses = cn(
    'relative overflow-hidden',
    aspectRatio && `aspect-[${aspectRatio}]`,
    className
  );

  // Image classes for smooth transitions
  const imageClasses = cn(
    'w-full h-full object-cover transition-all duration-300',
    isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
  );

  return (
    <div className={containerClasses}>
      {/* Main image */}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={imageClasses}
          style={{ 
            display: isLoaded ? 'block' : 'none' 
          }}
        />
      )}
      
      {/* Loading state */}
      {isLoading && !isLoaded && (
        <div className="absolute inset-0">
          <LoadingPlaceholder />
        </div>
      )}
      
      {/* Error state */}
      {hasError && !isLoading && (
        <div className="absolute inset-0">
          <ErrorFallback />
        </div>
      )}
      
      {/* No image provided */}
      {!src && !isLoading && (
        <div className="absolute inset-0">
          <ErrorFallback />
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;