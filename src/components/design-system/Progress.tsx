import React from 'react';
import { cn } from '@/lib/utils/cn';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  max?: number;
  variant?: 'navy' | 'emerald' | 'amber' | 'red';
  showLabel?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  variant = 'navy',
  showLabel = false,
  label,
  size = 'md',
  className = '',
  ...props
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const variantStyles = {
    navy: 'bg-[#0B2346]',
    emerald: 'bg-[#2E9E45]',
    amber: 'bg-[#F28C28]',
    red: 'bg-[#D62828]',
  };

  return (
    <div className={cn('w-full space-y-1.5', className)} {...props}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between text-xs font-semibold text-[#0B2346]">
          <span>{label}</span>
          <span className="font-mono text-[11px] text-gray-500">{percentage}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cn('w-full bg-gray-200 overflow-hidden', sizeStyles[size])}
      >
        <div
          className={cn('h-full transition-all duration-300 ease-out', variantStyles[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
