import React from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface FabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'sm' | 'md' | 'lg';
}

export function Fab({
  icon,
  position = 'bottom-right',
  size = 'md',
  className,
  ...props
}: FabProps) {
  const positionClasses = {
    'bottom-right': 'bottom-20 right-4',
    'bottom-left': 'bottom-20 left-4',
    'top-right': 'top-20 right-4',
    'top-left': 'top-20 left-4',
  };

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-14 w-14',
    lg: 'h-16 w-16',
  };

  return (
    <Button
      className={cn(
        'fixed z-10 rounded-full shadow-lg flex items-center justify-center',
        positionClasses[position],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {icon}
    </Button>
  );
}
