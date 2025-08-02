"use client";

import Image from 'next/image';
import { useState } from 'react';
import { Skeleton } from './skeleton';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  dataAiHint?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 85,
  placeholder = 'empty',
  blurDataURL,
  dataAiHint,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  // Fallback to placeholder if image fails to load
  if (hasError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500 text-sm">Image unavailable</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <Skeleton className="absolute inset-0 z-10" />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        priority={priority}
        sizes={sizes}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        data-ai-hint={dataAiHint}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          objectFit: 'cover',
        }}
      />
    </div>
  );
}

// Responsive image component with predefined sizes
export function ResponsiveImage({
  src,
  alt,
  className = '',
  priority = false,
  dataAiHint,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  dataAiHint?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      className={className}
      priority={priority}
      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
      dataAiHint={dataAiHint}
    />
  );
}

// Hero image component for featured articles
export function HeroImage({
  src,
  alt,
  className = '',
  dataAiHint,
}: {
  src: string;
  alt: string;
  className?: string;
  dataAiHint?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      className={className}
      priority={true}
      sizes="(max-width: 768px) 100vw, 1200px"
      dataAiHint={dataAiHint}
    />
  );
} 