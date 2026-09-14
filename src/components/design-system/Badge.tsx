import React from 'react';
import { cn } from '@/lib/utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'navy' | 'neutral' | 'phase1' | 'phase2' | 'phase3' | 'outline';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
}) => {
  const variantStyles = {
    navy: 'bg-[#0B2346] text-white',
    neutral: 'bg-white text-[#0B2346] border border-[#E2E8F0]',
    phase1: 'bg-[#D62828]/10 text-[#D62828] border border-[#D62828]/20',
    phase2: 'bg-[#F28C28]/10 text-[#d97518] border border-[#F28C28]/20',
    phase3: 'bg-[#2E9E45]/10 text-[#2E9E45] border border-[#2E9E45]/20',
    outline: 'border border-[#0B2346]/20 text-[#0B2346] bg-transparent',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest rounded-none select-none',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
