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
  unoptimized?: boolean;
}

function normalizeImageSrc(src: string): string {
  if (!src || typeof src !== 'string') {
    return '/placeholder-image.svg';
  }

  const trimmed = src.trim();

  // If it's a Base64 image, return it as is
  if (trimmed.startsWith('data:')) {
    return trimmed;
  }

  // Already absolute or local
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
    return trimmed;
  }

  // Protocol-relative URLs
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  // Plain domain or path-like (e.g., example.com/img.jpg)
  if (/^[a-z0-9.-]+\.[a-z]{2,}[/]?.*/i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return '/placeholder-image.svg';
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
  unoptimized = false, // Default to false for optimization
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  // const [hasError, setHasError] = useState(false); // Removed hasError state

  const normalizedSrc = normalizeImageSrc(src);
  console.log(`OptimizedImage - Original src: ${src}, Normalized src: ${normalizedSrc}`);
  const isBase64 = normalizedSrc.startsWith('data:');

  const handleLoad = () => {
    // console.log('Image loaded successfully:', src);
    setIsLoading(false);
    // setHasError(false); // Removed
    onLoad?.();
  };

  const handleError = () => {
    console.error('Image failed to load:', src);
    setIsLoading(false);
    // setHasError(true); // Removed
    onError?.();
  };

  // Removed hasError conditional rendering. Let Next.js Image component handle placeholder.
  // if (hasError) {
  //   return (
  //     <div className={`bg-gray-200 flex items-center justify-center ${className} ${fill ? 'absolute inset-0' : ''}`}
  //          style={!fill && width && height ? { width, height } : {}}>
  //       <span className="text-gray-500 text-sm">Image unavailable</span>
  //     </div>
  //   );
  // }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <Skeleton className="absolute inset-0 z-10" />
      )}
      <Image
        src={normalizedSrc}
        alt={alt}
        // If Base64, use fill to match details page behavior, otherwise use provided dimensions or fill
        width={isBase64 ? undefined : (fill ? undefined : width)}
        height={isBase64 ? undefined : (fill ? undefined : height)}
        fill={isBase64 || fill} // If Base64, force fill; otherwise use passed fill prop
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        priority={priority}
        sizes={sizes}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        data-ai-hint={dataAiHint}
        onLoad={handleLoad}
        onError={handleError} // Call the centralized handleError
        unoptimized={isBase64 || unoptimized} // Ensure unoptimized prop from parent is respected
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
  width, 
  height, 
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  dataAiHint?: string;
  width?: number;
  height?: number;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width} // Pass width to OptimizedImage
      height={height} // Pass height to OptimizedImage
      fill={false} // Explicitly set fill to false unless it's a base64 image (handled in OptimizedImage)
      className={className}
      priority={priority}
      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
      dataAiHint={dataAiHint}
      unoptimized={false} // Ensure optimization is enabled for responsive images (unless Base64)
    />
  );
}

// Hero image component for featured articles
export function HeroImage({
  src,
  alt,
  className = '',
  dataAiHint,
  width, 
  height, 
}: {
  src: string;
  alt: string;
  className?: string;
  dataAiHint?: string;
  width?: number;
  height?: number;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width} // Pass width to OptimizedImage
      height={height} // Pass height to OptimizedImage
      fill={false} // Explicitly set fill to false unless it's a base64 image (handled in OptimizedImage)
      className={className}
      priority={true}
      sizes="(max-width: 768px) 100vw, 1200px"
      dataAiHint={dataAiHint}
      unoptimized={false} // Ensure optimization is enabled for hero images (unless Base64)
    />
  );
} 