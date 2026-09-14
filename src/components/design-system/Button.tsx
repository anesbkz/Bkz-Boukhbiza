import React from 'react';
import { cn } from '@/lib/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'phase1' | 'phase2' | 'phase3' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-none uppercase tracking-wider text-xs cursor-pointer';

  const sizeStyles = {
    sm: 'h-8 px-3 py-1 text-xs',
    md: 'h-10 px-5 py-2 text-xs',
    lg: 'h-12 px-8 py-3 text-sm',
  };

  const variantStyles = {
    primary: 'bg-[#0B2346] text-white hover:bg-[#12366b] focus:ring-[#0B2346]',
    secondary: 'bg-[#F5F7FA] text-[#0B2346] border border-[#E2E8F0] hover:bg-white focus:ring-[#0B2346]',
    phase1: 'bg-[#D62828] text-white hover:bg-[#b01e1e] focus:ring-[#D62828]',
    phase2: 'bg-[#F28C28] text-white hover:bg-[#d97518] focus:ring-[#F28C28]',
    phase3: 'bg-[#2E9E45] text-white hover:bg-[#247f37] focus:ring-[#2E9E45]',
    outline: 'border border-[#0B2346] text-[#0B2346] bg-transparent hover:bg-[#0B2346]/5 focus:ring-[#0B2346]',
    ghost: 'text-[#0B2346] bg-transparent hover:bg-[#F5F7FA] focus:ring-[#0B2346]',
  };

  return (
    <button
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Processing...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};
