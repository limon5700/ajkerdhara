import React from 'react';
import { Badge } from '@/components/ui/badge';

interface CategoryBadgeProps {
  category: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CategoryBadge({ category, size = 'md', className = '' }: CategoryBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  return (
    <Badge 
      variant="secondary" 
      className={`${sizeClasses[size]} bg-red-100 text-red-700 border-0 font-semibold ${className}`}
    >
      {category}
    </Badge>
  );
}

